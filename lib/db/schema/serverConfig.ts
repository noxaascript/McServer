import { pgTable, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const serverConfigTable = pgTable("server_config", {
  id: integer("id").primaryKey().default(1),
  serverIp: text("server_ip").notNull().default(""),
  customDomain: text("custom_domain").notNull().default(""),
  maxRamGb: integer("max_ram_gb").notNull().default(2),
  minRamGb: integer("min_ram_gb").notNull().default(1),
  serverName: text("server_name").notNull().default("My MC Server"),
  motd: text("motd").notNull().default("A Paper + Geyser Server"),
  maxPlayers: integer("max_players").notNull().default(20),
  javaPort: integer("java_port").notNull().default(25565),
  bedrockPort: integer("bedrock_port").notNull().default(19132),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertServerConfigSchema = createInsertSchema(serverConfigTable).omit({ id: true, updatedAt: true });
export type InsertServerConfig = z.infer<typeof insertServerConfigSchema>;
export type ServerConfig = typeof serverConfigTable.$inferSelect;
