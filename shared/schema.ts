import { sql } from "drizzle-orm";
import { pgTable, text, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// ==================== Author Interface & Schema ====================
export interface Author {
  name: string;
  isCorresponding?: boolean;
  role?: string;
  department?: string;
  institution: string;
  email?: string;
}

export const authorSchema = z.object({
  name: z.string().min(1, "Author name is required"),
  isCorresponding: z.boolean().optional(),
  role: z.string().optional(),
  department: z.string().optional(),
  institution: z.string().min(1, "Institution is required"),
  email: z.string().optional(),
});

// ==================== Journal Article Interface & Schema ====================
export interface JournalArticle {
  id: string;
  serialNumber: string;
  slug: string;
  aliases?: string[];
  title: string;
  authors: Author[];
  section: string;
  pages: string;
  doi?: string;
  pdfUrl: string;
  abstract: string;
  keywords?: string[];
  volume: string;
  issue: string;
  year: string;
  date: string;
  status?: "published" | "draft" | "archived";
}

export const journalArticleSchema = z.object({
  id: z.string(),
  serialNumber: z.string().min(1, "Serial number is required"),
  slug: z.string().min(1, "Slug is required"),
  aliases: z.array(z.string()).optional(),
  title: z.string().min(1, "Title is required"),
  authors: z.array(authorSchema).min(1, "At least one author is required"),
  section: z.string().min(1, "Section is required"),
  pages: z.string().min(1, "Pages are required"),
  doi: z.string().optional(),
  pdfUrl: z.string().min(1, "PDF file or URL is required"),
  abstract: z.string().min(1, "Abstract is required"),
  keywords: z.array(z.string()).optional(),
  volume: z.string().min(1, "Volume is required"),
  issue: z.string().min(1, "Issue is required"),
  year: z.string().min(1, "Year is required"),
  date: z.string().min(1, "Date/period is required"),
  status: z.enum(["published", "draft", "archived"]).optional(),
});

export type InsertArticle = Omit<JournalArticle, "id">;
export const insertArticleSchema = z.object({
  serialNumber: z.string().min(1, "Serial number is required"),
  slug: z.string().min(1, "Slug is required"),
  aliases: z.array(z.string()).optional(),
  title: z.string().min(1, "Title is required"),
  authors: z.array(authorSchema).min(1, "At least one author is required"),
  section: z.string().min(1, "Section is required"),
  pages: z.string().min(1, "Pages are required"),
  doi: z.string().optional(),
  pdfUrl: z.string().min(1, "PDF file or URL is required"),
  abstract: z.string().min(1, "Abstract is required"),
  keywords: z.array(z.string()).optional(),
  volume: z.string().min(1, "Volume is required"),
  issue: z.string().min(1, "Issue is required"),
  year: z.string().min(1, "Year is required"),
  date: z.string().min(1, "Date/period is required"),
  status: z.enum(["published", "draft", "archived"]).optional(),
});

// ==================== Editorial Board / People Interface & Schema ====================
export interface JournalPerson {
  id: string;
  name: string;
  category: "leadership" | "board_member";
  role: string;
  designation: string;
  qualifications?: string;
  department?: string;
  institution?: string;
  email?: string;
  secondaryEmail?: string;
  orcid?: string;
  note?: string;
  address?: string;
  order: number;
}

export const journalPersonSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required"),
  category: z.enum(["leadership", "board_member"]),
  role: z.string().min(1, "Role is required"),
  designation: z.string().min(1, "Designation is required"),
  qualifications: z.string().optional(),
  department: z.string().optional(),
  institution: z.string().optional(),
  email: z.string().optional(),
  secondaryEmail: z.string().optional(),
  orcid: z.string().optional(),
  note: z.string().optional(),
  address: z.string().optional(),
  order: z.number().default(0),
});

export type InsertPerson = Omit<JournalPerson, "id">;
export const insertPersonSchema = z.object({
  name: z.string().min(1, "Name is required"),
  category: z.enum(["leadership", "board_member"]),
  role: z.string().min(1, "Role is required"),
  designation: z.string().min(1, "Designation is required"),
  qualifications: z.string().optional(),
  department: z.string().optional(),
  institution: z.string().optional(),
  email: z.string().optional(),
  secondaryEmail: z.string().optional(),
  orcid: z.string().optional(),
  note: z.string().optional(),
  address: z.string().optional(),
  order: z.number().default(0),
});

// ==================== Journal Settings Interface & Schema ====================
export interface JournalSettings {
  journalTitle: string;
  journalAbbr: string;
  publisherName: string;
  publisherWebsite: string;
  publisherLocation: string;
  editorialOffice: string;
  frequency: string;
  format: string;
  primaryLanguage: string;
  peerReviewType: string;
  accessModel: string;
  submissionEmail: string;
  contactEmail: string;
  currentVolume: string;
  currentIssue: string;
  currentYear: string;
  currentPeriod: string;
  issueDescription: string;
  subjectAreas: string[];
}

export const journalSettingsSchema = z.object({
  journalTitle: z.string().default("Journal of Politics, Society and Governance"),
  journalAbbr: z.string().default("JPSG"),
  publisherName: z.string().default("Democratic Organisation for Civic Knowledge Foundation"),
  publisherWebsite: z.string().default("https://docknowledge.org"),
  publisherLocation: z.string().default("Hyderabad, Telangana, India"),
  editorialOffice: z.string().default("#9-164/3, Gandhi Nagar, Madhurawada, Visakhapatnam, Andhra Pradesh, India - 530048"),
  frequency: z.string().default("Four Issues Annually (Quarterly)"),
  format: z.string().default("Online / Digital Publication"),
  primaryLanguage: z.string().default("English"),
  peerReviewType: z.string().default("Double-Blind Peer Review"),
  accessModel: z.string().default("Open Access"),
  submissionEmail: z.string().default("jpsg@docknowledge.org"),
  contactEmail: z.string().default("contactus.jpsg@docknowledge.org"),
  currentVolume: z.string().default("Volume 1"),
  currentIssue: z.string().default("Issue 1"),
  currentYear: z.string().default("2027"),
  currentPeriod: z.string().default("January–March 2027"),
  issueDescription: z.string().default(
    "The inaugural issue of the Journal of Politics, Society and Governance (JPSG) brings together five original peer-reviewed research articles examining women's everyday micro-politics and body politics in resistance movements, universal consciousness in Advaita Vedanta, rural microfinance and women's self-help groups, environmental governance and judicial regulation in India, and technology and digital inclusion for traditional artisans."
  ),
  subjectAreas: z.array(z.string()).default([]),
});

export interface JournalData {
  settings: JournalSettings;
  articles: JournalArticle[];
  people: JournalPerson[];
}
