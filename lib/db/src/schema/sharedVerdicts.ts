import { pgTable, text, real, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const sharedVerdictsTable = pgTable("shared_verdicts", {
  id: text("id").primaryKey(),
  idea: text("idea").notNull(),
  score: real("score").notNull(),
  scoreReason: text("score_reason").notNull(),
  targetUser: text("target_user").notNull(),
  biggestRisk: text("biggest_risk").notNull(),
  competitors: jsonb("competitors").$type<string[]>().notNull(),
  tenXSuggestion: text("ten_x_suggestion").notNull(),
  roastMode: boolean("roast_mode").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const insertSharedVerdictSchema = createInsertSchema(sharedVerdictsTable);
export const selectSharedVerdictSchema = createSelectSchema(sharedVerdictsTable);

export type InsertSharedVerdict = typeof sharedVerdictsTable.$inferInsert;
export type SharedVerdict = typeof sharedVerdictsTable.$inferSelect;
