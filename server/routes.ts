import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  insertArticleSchema,
  insertPersonSchema,
  journalSettingsSchema,
} from "@shared/schema";
import multer from "multer";
import path from "path";
import fs from "fs";

// Configure Multer storage for PDF uploads
const articlesDir = path.resolve(process.cwd(), "client", "public", "articles");
if (!fs.existsSync(articlesDir)) {
  fs.mkdirSync(articlesDir, { recursive: true });
}

const multerStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, articlesDir);
  },
  filename: (_req, file, cb) => {
    // Generate clean sanitized filename with timestamp
    const ext = path.extname(file.originalname).toLowerCase() || ".pdf";
    const base = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .replace(/_+/g, "_");
    const uniqueName = `${base}_${Date.now()}${ext}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage: multerStorage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
  fileFilter: (_req, file, cb) => {
    if (
      file.mimetype === "application/pdf" ||
      file.originalname.toLowerCase().endsWith(".pdf") ||
      file.originalname.toLowerCase().endsWith(".docx") ||
      file.originalname.toLowerCase().endsWith(".doc")
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF and Word documents are permitted for upload"));
    }
  },
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Direct redirect endpoints to DOCK Foundation website
  app.get(["/dock", "/docknowledge", "/dock-foundation", "/foundation"], (_req, res) => {
    res.redirect(301, "https://docknowledge.org");
  });

  // ==================== AUTHENTICATION ROUTES ====================
  app.post("/api/auth/login", (req: Request, res: Response) => {
    const { password } = req.body;
    if (storage.verifyAdmin(password)) {
      res.json({
        success: true,
        user: { username: "admin", role: "editor" },
        token: "admin-authenticated-session",
      });
    } else {
      res.status(401).json({ message: "Invalid administrator password. Please check your credentials." });
    }
  });

  app.get("/api/auth/me", (_req: Request, res: Response) => {
    res.json({ authenticated: true, user: { username: "admin", role: "editor" } });
  });

  app.post("/api/auth/logout", (_req: Request, res: Response) => {
    res.json({ success: true, message: "Logged out successfully" });
  });

  // ==================== COMPLETE JOURNAL DATA ====================
  app.get("/api/journal/data", async (_req: Request, res: Response) => {
    try {
      const data = await storage.getJournalData();
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ message: err.message || "Failed to load journal data" });
    }
  });

  app.post("/api/journal/reset", async (_req: Request, res: Response) => {
    try {
      const data = await storage.resetToDefault();
      res.json({ success: true, data, message: "Reset to default journal configuration successfully" });
    } catch (err: any) {
      res.status(500).json({ message: err.message || "Failed to reset data" });
    }
  });

  // ==================== ARTICLES API ====================
  app.get("/api/articles", async (_req: Request, res: Response) => {
    try {
      const articles = await storage.getArticles();
      res.json(articles);
    } catch (err: any) {
      res.status(500).json({ message: err.message || "Failed to fetch articles" });
    }
  });

  app.get("/api/articles/:slug", async (req: Request, res: Response) => {
    try {
      const slug = String(req.params.slug);
      const article = await storage.getArticle(slug);
      if (!article) {
        return res.status(404).json({ message: "Article not found" });
      }
      res.json(article);
    } catch (err: any) {
      res.status(500).json({ message: err.message || "Failed to fetch article" });
    }
  });

  app.post("/api/articles", async (req: Request, res: Response) => {
    try {
      const parsed = insertArticleSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          message: "Invalid article submission",
          errors: parsed.error.flatten().fieldErrors,
        });
      }

      const created = await storage.createArticle(parsed.data);
      res.status(201).json(created);
    } catch (err: any) {
      res.status(500).json({ message: err.message || "Failed to create article" });
    }
  });

  app.put("/api/articles/:id", async (req: Request, res: Response) => {
    try {
      const id = String(req.params.id);
      const updated = await storage.updateArticle(id, req.body);
      if (!updated) {
        return res.status(404).json({ message: "Article not found" });
      }
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ message: err.message || "Failed to update article" });
    }
  });

  app.delete("/api/articles/:id", async (req: Request, res: Response) => {
    try {
      const id = String(req.params.id);
      const deleted = await storage.deleteArticle(id);
      if (!deleted) {
        return res.status(404).json({ message: "Article not found" });
      }
      res.json({ success: true, message: "Article deleted successfully" });
    } catch (err: any) {
      res.status(500).json({ message: err.message || "Failed to delete article" });
    }
  });

  // ==================== PEOPLE / EDITORIAL BOARD API ====================
  app.get("/api/people", async (_req: Request, res: Response) => {
    try {
      const people = await storage.getPeople();
      res.json(people);
    } catch (err: any) {
      res.status(500).json({ message: err.message || "Failed to fetch people" });
    }
  });

  app.get("/api/people/:id", async (req: Request, res: Response) => {
    try {
      const id = String(req.params.id);
      const person = await storage.getPerson(id);
      if (!person) {
        return res.status(404).json({ message: "Person not found" });
      }
      res.json(person);
    } catch (err: any) {
      res.status(500).json({ message: err.message || "Failed to fetch person" });
    }
  });

  app.post("/api/people", async (req: Request, res: Response) => {
    try {
      const parsed = insertPersonSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          message: "Invalid person submission",
          errors: parsed.error.flatten().fieldErrors,
        });
      }

      const created = await storage.createPerson(parsed.data);
      res.status(201).json(created);
    } catch (err: any) {
      res.status(500).json({ message: err.message || "Failed to add person" });
    }
  });

  app.put("/api/people/:id", async (req: Request, res: Response) => {
    try {
      const id = String(req.params.id);
      const updated = await storage.updatePerson(id, req.body);
      if (!updated) {
        return res.status(404).json({ message: "Person not found" });
      }
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ message: err.message || "Failed to update person" });
    }
  });

  app.delete("/api/people/:id", async (req: Request, res: Response) => {
    try {
      const id = String(req.params.id);
      const deleted = await storage.deletePerson(id);
      if (!deleted) {
        return res.status(404).json({ message: "Person not found" });
      }
      res.json({ success: true, message: "Person deleted successfully" });
    } catch (err: any) {
      res.status(500).json({ message: err.message || "Failed to delete person" });
    }
  });

  app.put("/api/people/reorder", async (req: Request, res: Response) => {
    try {
      const { orderedIds } = req.body;
      if (!Array.isArray(orderedIds)) {
        return res.status(400).json({ message: "orderedIds must be an array of IDs" });
      }
      const reordered = await storage.reorderPeople(orderedIds);
      res.json(reordered);
    } catch (err: any) {
      res.status(500).json({ message: err.message || "Failed to reorder people" });
    }
  });

  // ==================== SETTINGS & PARTICULARS API ====================
  app.get("/api/settings", async (_req: Request, res: Response) => {
    try {
      const settings = await storage.getSettings();
      res.json(settings);
    } catch (err: any) {
      res.status(500).json({ message: err.message || "Failed to fetch settings" });
    }
  });

  app.put("/api/settings", async (req: Request, res: Response) => {
    try {
      const updated = await storage.updateSettings(req.body);
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ message: err.message || "Failed to update settings" });
    }
  });

  // ==================== FILE UPLOAD API ====================
  app.post("/api/upload", upload.single("file"), (req: Request, res: Response) => {
    if (!req.file) {
      return res.status(400).json({ message: "No file was uploaded" });
    }

    const publicUrl = `/articles/${req.file.filename}`;

    // Also copy to dist/public/articles if dist exists
    try {
      const distArticlesDir = path.resolve(process.cwd(), "dist", "public", "articles");
      if (fs.existsSync(distArticlesDir)) {
        fs.copyFileSync(req.file.path, path.join(distArticlesDir, req.file.filename));
      }
    } catch (err) {
      console.warn("Could not copy uploaded file to dist:", err);
    }

    res.json({
      success: true,
      url: publicUrl,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
    });
  });

  return httpServer;
}
