import { Router } from "express";
import { db } from "@workspace/db";
import { serverConfigTable } from "@workspace/db";
import { UpdateConfigBody } from "@workspace/api-zod";
import { eq } from "drizzle-orm";
import { logger } from "../lib/logger";

const router = Router();

async function ensureConfig() {
  const rows = await db.select().from(serverConfigTable).where(eq(serverConfigTable.id, 1));
  if (rows.length === 0) {
    await db.insert(serverConfigTable).values({ id: 1 });
  }
  return (await db.select().from(serverConfigTable).where(eq(serverConfigTable.id, 1)))[0];
}

router.get("/config", async (req, res) => {
  try {
    const config = await ensureConfig();
    res.json(config);
  } catch (err) {
    req.log.error({ err }, "Failed to get config");
    res.status(500).json({ error: "Failed to get config" });
  }
});

router.put("/config", async (req, res) => {
  const parsed = UpdateConfigBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid config data" });
    return;
  }

  try {
    await ensureConfig();
    const [updated] = await db
      .update(serverConfigTable)
      .set(parsed.data)
      .where(eq(serverConfigTable.id, 1))
      .returning();
    logger.info("Server config updated");
    res.json(updated);
  } catch (err) {
    req.log.error({ err }, "Failed to update config");
    res.status(500).json({ error: "Failed to update config" });
  }
});

export default router;
