import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { db } from "@workspace/db";
import { modsTable } from "@workspace/db";
import { UpdateModBody, GetModParams, UpdateModParams, DeleteModParams, ListModsQueryParams } from "@workspace/api-zod";
import { eq, sql } from "drizzle-orm";
import { logger } from "../lib/logger";

const router = Router();

const MAX_FILE_SIZE = 200 * 1024 * 1024; // 200MB

const workspaceRoot = process.cwd().endsWith(path.join("artifacts", "api-server"))
  ? path.resolve(process.cwd(), "../..")
  : process.cwd();

const uploadsDir = path.resolve(workspaceRoot, "artifacts/api-server/uploads/mods");
fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const safe = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, "_");
    cb(null, `${Date.now()}-${safe}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if ([".jar", ".zip"].includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Only .jar and .zip files are allowed"));
    }
  },
});

router.get("/mods/stats", async (req, res) => {
  try {
    const all = await db.select().from(modsTable);
    const byCategory: Record<string, number> = {};
    let totalSizeBytes = 0;
    let enabled = 0;
    let disabled = 0;
    for (const mod of all) {
      totalSizeBytes += mod.sizeBytes;
      byCategory[mod.category] = (byCategory[mod.category] || 0) + 1;
      if (mod.enabled === "true") enabled++;
      else disabled++;
    }
    res.json({ total: all.length, enabled, disabled, totalSizeBytes, byCategory });
  } catch (err) {
    req.log.error({ err }, "Failed to get mod stats");
    res.status(500).json({ error: "Failed to get mod stats" });
  }
});

router.get("/mods", async (req, res) => {
  const parsed = ListModsQueryParams.safeParse(req.query);
  try {
    let rows = await db.select().from(modsTable);
    if (parsed.success && parsed.data.category) {
      rows = rows.filter(m => m.category === parsed.data.category);
    }
    res.json(rows);
  } catch (err) {
    req.log.error({ err }, "Failed to list mods");
    res.status(500).json({ error: "Failed to list mods" });
  }
});

router.post("/mods", (req, res) => {
  upload.single("file")(req, res, async (err) => {
    if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
      res.status(413).json({ error: "File exceeds 200MB limit" });
      return;
    }
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    if (!req.file) {
      res.status(400).json({ error: "No file uploaded" });
      return;
    }
    const { name, description = "", version = "", author = "", category = "general" } = req.body;
    if (!name) {
      res.status(400).json({ error: "Mod name is required" });
      return;
    }
    try {
      const [mod] = await db.insert(modsTable).values({
        name,
        filename: req.file.originalname,
        description,
        version,
        author,
        category,
        sizeBytes: req.file.size,
        filePath: req.file.path,
        enabled: "true",
      }).returning();
      logger.info({ name }, "Mod uploaded");
      res.status(201).json(mod);
    } catch (dbErr) {
      req.log.error({ err: dbErr }, "Failed to save mod");
      fs.unlinkSync(req.file.path);
      res.status(500).json({ error: "Failed to save mod" });
    }
  });
});

router.get("/mods/:id", async (req, res) => {
  const parsed = GetModParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) { res.status(400).json({ error: "Invalid id" }); return; }
  try {
    const [mod] = await db.select().from(modsTable).where(eq(modsTable.id, parsed.data.id));
    if (!mod) { res.status(404).json({ error: "Mod not found" }); return; }
    res.json(mod);
  } catch (err) {
    req.log.error({ err }, "Failed to get mod");
    res.status(500).json({ error: "Failed to get mod" });
  }
});

router.patch("/mods/:id", async (req, res) => {
  const paramsParsed = UpdateModParams.safeParse({ id: Number(req.params.id) });
  const bodyParsed = UpdateModBody.safeParse(req.body);
  if (!paramsParsed.success) { res.status(400).json({ error: "Invalid id" }); return; }
  if (!bodyParsed.success) { res.status(400).json({ error: "Invalid body" }); return; }
  try {
    const [mod] = await db.update(modsTable).set(bodyParsed.data).where(eq(modsTable.id, paramsParsed.data.id)).returning();
    if (!mod) { res.status(404).json({ error: "Mod not found" }); return; }
    res.json(mod);
  } catch (err) {
    req.log.error({ err }, "Failed to update mod");
    res.status(500).json({ error: "Failed to update mod" });
  }
});

router.delete("/mods/:id", async (req, res) => {
  const parsed = DeleteModParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) { res.status(400).json({ error: "Invalid id" }); return; }
  try {
    const [mod] = await db.select().from(modsTable).where(eq(modsTable.id, parsed.data.id));
    if (!mod) { res.status(404).json({ error: "Mod not found" }); return; }
    if (fs.existsSync(mod.filePath)) fs.unlinkSync(mod.filePath);
    await db.delete(modsTable).where(eq(modsTable.id, parsed.data.id));
    res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "Failed to delete mod");
    res.status(500).json({ error: "Failed to delete mod" });
  }
});

export default router;
