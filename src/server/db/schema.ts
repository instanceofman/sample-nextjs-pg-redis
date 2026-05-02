import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const guestbook = pgTable("guestbook", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type Guestbook = typeof guestbook.$inferSelect;
export type NewGuestbook = typeof guestbook.$inferInsert;
