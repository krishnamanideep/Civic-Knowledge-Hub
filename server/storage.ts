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

  private deduplicateData(data: JournalData): JournalData {
    if (!data) return data;

    // Deduplicate articles by unique key
    const seenArticleKeys = new Set<string>();
    const uniqueArticles: JournalArticle[] = [];
    for (const a of data.articles || []) {
      const slugKey = a.slug ? a.slug.toLowerCase().trim() : "";
      const serialKey = a.serialNumber ? a.serialNumber.trim() : "";
      const titleKey = a.title ? a.title.toLowerCase().trim() : "";
      const idKey = a.id ? a.id.trim() : "";

      const compositeKey = slugKey || serialKey || idKey || titleKey;
      if (!seenArticleKeys.has(compositeKey)) {
        seenArticleKeys.add(compositeKey);
        if (slugKey) seenArticleKeys.add(slugKey);
        if (serialKey) seenArticleKeys.add(`s-${serialKey}`);
        uniqueArticles.push(a);
      }
    }

    // Deduplicate people by category + name
    const seenPeopleKeys = new Set<string>();
    const uniquePeople: JournalPerson[] = [];
    for (const p of data.people || []) {
      const nameKey = `${p.category || "board_member"}-${(p.name || "").toLowerCase().trim()}`;
      const idKey = p.id ? `id-${p.id}` : "";
      if (!seenPeopleKeys.has(nameKey) && (!idKey || !seenPeopleKeys.has(idKey))) {
        seenPeopleKeys.add(nameKey);
        if (idKey) seenPeopleKeys.add(idKey);
        uniquePeople.push(p);
      }
    }

    return {
      settings: data.settings || initialJournalData.settings,
      articles: uniqueArticles,
      people: uniquePeople,
    };
  }

  private loadData(): JournalData {
    try {
      if (fs.existsSync(this.dataFilePath)) {
        const raw = fs.readFileSync(this.dataFilePath, "utf-8");
        const parsed = JSON.parse(raw);
        if (parsed.settings && parsed.articles && parsed.people) {
          const cleaned = this.deduplicateData(parsed as JournalData);
          this.saveData(cleaned);
          return cleaned;
        }
      }
    } catch (err) {
      console.warn("Could not read journal data from disk, using defaults:", err);
    }

    // Default initialization
    const cloned = JSON.parse(JSON.stringify(initialJournalData));
    const cleaned = this.deduplicateData(cloned);
    this.saveData(cleaned);
    return cleaned;
  }

  private saveData(dataToSave: JournalData = this.data) {
    try {
      const cleaned = this.deduplicateData(dataToSave);
      this.data = cleaned;
      fs.writeFileSync(this.dataFilePath, JSON.stringify(cleaned, null, 2), "utf-8");
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
    const slug =
      insertArticle.slug?.trim() ||
      insertArticle.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");

    // Check if article already exists by slug, ID, serialNumber, or exact title
    const existingIndex = this.data.articles.findIndex(
      (a) =>
        (insertArticle.serialNumber && a.serialNumber === insertArticle.serialNumber) ||
        (insertArticle.slug && a.slug.toLowerCase() === insertArticle.slug.toLowerCase()) ||
        a.slug.toLowerCase() === slug.toLowerCase() ||
        a.title.trim().toLowerCase() === insertArticle.title.trim().toLowerCase()
    );

    if (existingIndex !== -1) {
      // Update existing article instead of creating duplicate
      const current = this.data.articles[existingIndex];
      const updated: JournalArticle = {
        ...current,
        ...insertArticle,
        id: current.id,
        slug: insertArticle.slug?.trim() || current.slug,
        serialNumber: insertArticle.serialNumber || current.serialNumber,
        aliases: insertArticle.aliases || current.aliases || [],
        keywords: insertArticle.keywords || current.keywords || [],
        status: insertArticle.status || current.status || "published",
      };
      this.data.articles[existingIndex] = updated;
      this.saveData();
      return updated;
    }

    // Determine serial number
    const maxSerial = this.data.articles.reduce((max, a) => {
      const num = parseInt(a.serialNumber, 10);
      return !isNaN(num) && num > max ? num : max;
    }, 0);
    const nextNum = (maxSerial + 1).toString().padStart(2, "0");
    const serialNumber = insertArticle.serialNumber || nextNum;
    const id = serialNumber;

    const newArticle: JournalArticle = {
      ...insertArticle,
      id,
      slug,
      serialNumber,
      aliases: insertArticle.aliases || [],
      keywords: insertArticle.keywords || [],
      status: insertArticle.status || "published",
    };

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
      slug: updates.slug?.trim() || current.slug,
      serialNumber: updates.serialNumber || current.serialNumber,
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
    // Check if person already exists by name and category
    const existingIndex = this.data.people.findIndex(
      (p) =>
        p.category === insertPerson.category &&
        p.name.trim().toLowerCase() === insertPerson.name.trim().toLowerCase()
    );

    if (existingIndex !== -1) {
      // Update existing person instead of creating duplicate
      const current = this.data.people[existingIndex];
      const updated: JournalPerson = {
        ...current,
        ...insertPerson,
        id: current.id,
        order: insertPerson.order || current.order,
      };
      this.data.people[existingIndex] = updated;
      this.saveData();
      return updated;
    }

    const maxOrder = this.data.people.reduce((max, p) => Math.max(max, p.order || 0), 0);
    const order = insertPerson.order !== undefined && insertPerson.order !== 0 ? insertPerson.order : maxOrder + 1;
    const prefix = insertPerson.category === "leadership" ? "lead" : "board";
    const id = `${prefix}-${Date.now()}`;

    const newPerson: JournalPerson = {
      ...insertPerson,
      id,
      order,
      secondaryEmail: insertPerson.secondaryEmail || "",
      orcid: insertPerson.orcid || "",
      note: insertPerson.note || "",
      address: insertPerson.address || "",
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
    const orderMap = new Map<string, number>();
    orderedIds.forEach((id, index) => {
      orderMap.set(id, index + 1);
    });

    this.data.people = this.data.people.map((p) => {
      if (orderMap.has(p.id)) {
        return { ...p, order: orderMap.get(p.id)! };
      }
      return p;
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
    const cloned = JSON.parse(JSON.stringify(initialJournalData));
    const cleaned = this.deduplicateData(cloned);
    this.saveData(cleaned);
    return cleaned;
  }
}

export const storage = new JsonStorage();
