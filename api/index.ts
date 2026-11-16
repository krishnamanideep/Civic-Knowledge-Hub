import express, { type Request, type Response } from "express";
import { createServer } from "http";
import { registerRoutes } from "../server/routes";

const app = express();
const httpServer = createServer(app);

// Support large payloads (for base64 PDFs and full journal articles)
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: false, limit: "50mb" }));

// Standard CORS configuration
app.use((_req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, X-GitHub-Token");
  if (_req.method === "OPTIONS") {
    return res.status(200).end();
  }
  next();
});

let isInitialized = false;
let initPromise: Promise<void> | null = null;

async function ensureInitialized() {
  if (isInitialized) return;
  if (!initPromise) {
    initPromise = (async () => {
      await registerRoutes(httpServer, app);
      isInitialized = true;
    })();
  }
  await initPromise;
}

export default async function handler(req: Request, res: Response) {
  try {
    await ensureInitialized();
    return app(req, res);
  } catch (err: any) {
    console.error("Vercel Serverless Function Error:", err);
    return res.status(500).json({
      error: "Internal Server Error",
      message: err.message || "Failed to process request in serverless handler",
    });
  }
}
