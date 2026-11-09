import {
  type User,
  type InsertUser,
  type JournalArticle,
  type InsertArticle,
  type JournalPerson,
  type InsertPerson,
  type JournalSettings,
  type JournalData,
} from "@shared/schema";
import { initialJournalData } from "./default-data";
import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  getJournalData(): Promise<JournalData>;
  getArticles(): Promise<JournalArticle[]>;
  getArticle(idOrSlug: string): Promise<JournalArticle | undefined>;
  createArticle(article: InsertArticle): Promise<JournalArticle>;
  updateArticle(id: string, updates: Partial<InsertArticle>): Promise<JournalArticle | undefined>;
  deleteArticle(id: string): Promise<boolean>;

  getPeople(): Promise<JournalPerson[]>;
  getPerson(id: string): Promise<JournalPerson | undefined>;
  createPerson(person: InsertPerson): Promise<JournalPerson>;
  updatePerson(id: string, updates: Partial<InsertPerson>): Promise<JournalPerson | undefined>;
  deletePerson(id: string): Promise<boolean>;
  reorderPeople(orderedIds: string[]): Promise<JournalPerson[]>;

  getSettings(): Promise<JournalSettings>;
  updateSettings(updates: Partial<JournalSettings>): Promise<JournalSettings>;
  resetToDefault(): Promise<JournalData>;
  verifyAdmin(password: string): boolean;
}

export class JsonStorage implements IStorage {
  private dataFilePath: string;
  private users: Map<string, User>;
  private data: JournalData;

  constructor() {
    this.users = new Map();
    // Default admin user
    this.users.set("admin", {
      id: "admin",
      username: "admin",
      password: "admin",
    });

    const dataDir = path.resolve(process.cwd(), "server", "data");
    if (!fs.existsSync(dataDir)) {
      try {
        fs.mkdirSync(dataDir, { recursive: true });
      } catch (err) {
        console.error("Failed to create data directory:", err);
      }
    }

    this.dataFilePath = path.join(dataDir, "journal-data.json");
    this.data = this.loadData();
  }

  private loadData(): JournalData {
    try {
      if (fs.existsSync(this.dataFilePath)) {
        const raw = fs.readFileSync(this.dataFilePath, "utf-8");
        const parsed = JSON.parse(raw);
        if (parsed.settings && parsed.articles && parsed.people) {
          return parsed as JournalData;
        }
      }
    } catch (err) {
      console.warn("Could not read journal data from disk, using defaults:", err);
    }

    // Default initialization
    const cloned = JSON.parse(JSON.stringify(initialJournalData));
    this.saveData(cloned);
    return cloned;
  }

  private saveData(dataToSave: JournalData = this.data) {
    try {
      fs.writeFileSync(this.dataFilePath, JSON.stringify(dataToSave, null, 2), "utf-8");
    } catch (err) {
      console.error("Error writing journal data to disk:", err);
    }
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find((u) => u.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  verifyAdmin(password: string): boolean {
    // Accepts "admin", "admin123", or "dock2027"
    return password === "admin" || password === "admin123" || password === "dock2027";
  }

  async getJournalData(): Promise<JournalData> {
    return this.data;
  }

  async getArticles(): Promise<JournalArticle[]> {
    return this.data.articles;
  }

  async getArticle(idOrSlug: string): Promise<JournalArticle | undefined> {
    const normalized = idOrSlug.toLowerCase().trim();
    return this.data.articles.find(
      (a) =>
        a.id.toLowerCase() === normalized ||
        a.slug.toLowerCase() === normalized ||
        a.serialNumber.toLowerCase() === normalized ||
        a.aliases?.some((al) => al.toLowerCase() === normalized)
    );
  }

  async createArticle(insertArticle: InsertArticle): Promise<JournalArticle> {
    const nextNum = (this.data.articles.length + 1).toString().padStart(2, "0");
    const id = insertArticle.serialNumber || nextNum;

    // Ensure slug is clean
    const slug =
      insertArticle.slug?.trim() ||
      insertArticle.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");

    const newArticle: JournalArticle = {
      ...insertArticle,
      id,
      slug,
      serialNumber: insertArticle.serialNumber || id,
      aliases: insertArticle.aliases || [],
      keywords: insertArticle.keywords || [],
      status: insertArticle.status || "published",
    };

    // Check if ID already exists, if so generate UUID-based short ID
    if (this.data.articles.some((a) => a.id === newArticle.id)) {
      newArticle.id = `art-${Date.now()}`;
    }

    this.data.articles.push(newArticle);
    this.saveData();
    return newArticle;
  }

  async updateArticle(id: string, updates: Partial<InsertArticle>): Promise<JournalArticle | undefined> {
    const index = this.data.articles.findIndex((a) => a.id === id || a.slug === id);
    if (index === -1) return undefined;

    const current = this.data.articles[index];
    const updated: JournalArticle = {
      ...current,
      ...updates,
      id: current.id, // Preserve ID
    };

    this.data.articles[index] = updated;
    this.saveData();
    return updated;
  }

  async deleteArticle(id: string): Promise<boolean> {
    const initLen = this.data.articles.length;
    this.data.articles = this.data.articles.filter((a) => a.id !== id && a.slug !== id);
    if (this.data.articles.length !== initLen) {
      this.saveData();
      return true;
    }
    return false;
  }

  async getPeople(): Promise<JournalPerson[]> {
    return this.data.people.sort((a, b) => a.order - b.order);
  }

  async getPerson(id: string): Promise<JournalPerson | undefined> {
    return this.data.people.find((p) => p.id === id);
  }

  async createPerson(insertPerson: InsertPerson): Promise<JournalPerson> {
    const id = `person-${Date.now()}`;
    const maxOrder = this.data.people.reduce((max, p) => Math.max(max, p.order || 0), 0);
    const newPerson: JournalPerson = {
      ...insertPerson,
      id,
      order: insertPerson.order !== undefined && insertPerson.order !== 0 ? insertPerson.order : maxOrder + 1,
    };

    this.data.people.push(newPerson);
    this.saveData();
    return newPerson;
  }

  async updatePerson(id: string, updates: Partial<InsertPerson>): Promise<JournalPerson | undefined> {
    const index = this.data.people.findIndex((p) => p.id === id);
    if (index === -1) return undefined;

    const current = this.data.people[index];
    const updated: JournalPerson = {
      ...current,
      ...updates,
      id: current.id,
    };

    this.data.people[index] = updated;
    this.saveData();
    return updated;
  }

  async deletePerson(id: string): Promise<boolean> {
    const initLen = this.data.people.length;
    this.data.people = this.data.people.filter((p) => p.id !== id);
    if (this.data.people.length !== initLen) {
      this.saveData();
      return true;
    }
    return false;
  }

  async reorderPeople(orderedIds: string[]): Promise<JournalPerson[]> {
    orderedIds.forEach((id, index) => {
      const person = this.data.people.find((p) => p.id === id);
      if (person) {
        person.order = index + 1;
      }
    });

    this.data.people.sort((a, b) => a.order - b.order);
    this.saveData();
    return this.data.people;
  }

  async getSettings(): Promise<JournalSettings> {
    return this.data.settings;
  }

  async updateSettings(updates: Partial<JournalSettings>): Promise<JournalSettings> {
    this.data.settings = {
      ...this.data.settings,
      ...updates,
    };
    this.saveData();
    return this.data.settings;
  }

  async resetToDefault(): Promise<JournalData> {
    this.data = JSON.parse(JSON.stringify(initialJournalData));
    this.saveData();
    return this.data;
  }
}

export const storage = new JsonStorage();
