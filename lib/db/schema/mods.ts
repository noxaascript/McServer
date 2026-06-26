import { pgTable, text, integer, timestamp, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const modsTable = pgTable("mods", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  filename: text("filename").notNull(),
  description: text("description").notNull().default(""),
  version: text("version").notNull().default(""),
  author: text("author").notNull().default(""),
  category: text("category").notNull().default("general"),
  sizeBytes: integer("size_bytes").notNull().default(0),
  filePath: text("file_path").notNull(),
  enabled: text("enabled").notNull().default("true"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertModSchema = createInsertSchema(modsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertMod = z.infer<typeof insertModSchema>;
export type Mod = typeof modsTable.$inferSelect;
