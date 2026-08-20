import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/** Public partnership leads submitted from the sponsor-facing website. */
export const partnerEnquiries = mysqlTable("partner_enquiries", {
  id: int("id").autoincrement().primaryKey(),
  organizationName: varchar("organizationName", { length: 200 }).notNull(),
  contactName: varchar("contactName", { length: 160 }).notNull(),
  contactEmail: varchar("contactEmail", { length: 320 }).notNull(),
  organizationType: varchar("organizationType", { length: 80 }).notNull(),
  intendedSupport: varchar("intendedSupport", { length: 100 }).notNull(),
  activationTiming: varchar("activationTiming", { length: 80 }).notNull(),
  message: text("message"),
  status: mysqlEnum("status", ["new", "reviewing", "closed"]).default("new").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PartnerEnquiry = typeof partnerEnquiries.$inferSelect;
export type InsertPartnerEnquiry = typeof partnerEnquiries.$inferInsert;
