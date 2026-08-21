import { boolean, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

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

/** Aggregated, consent-safe statistics for the public Built In Jos directory. */
export const directoryMetrics = mysqlTable("directory_metrics", {
  id: int("id").autoincrement().primaryKey(),
  publicFounderCount: int("publicFounderCount").notNull(),
  ventureProfiles: int("ventureProfiles").notNull(),
  sectorsRepresented: int("sectorsRepresented").notNull(),
  locationsRepresented: int("locationsRepresented").notNull(),
  sourceRowCount: int("sourceRowCount").notNull(),
  uniqueCommunityRecords: int("uniqueCommunityRecords").notNull(),
  duplicateRecordsCollapsed: int("duplicateRecordsCollapsed").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type DirectoryMetric = typeof directoryMetrics.$inferSelect;
export type InsertDirectoryMetric = typeof directoryMetrics.$inferInsert;

/** Private consolidated source records; public endpoints expose aggregate statistics only. */
export const communityProfiles = mysqlTable("community_profiles", {
  id: int("id").autoincrement().primaryKey(),
  profileKey: varchar("profileKey", { length: 64 }).notNull().unique(),
  canonicalName: varchar("canonicalName", { length: 160 }).notNull(),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 48 }),
  ventureName: varchar("ventureName", { length: 200 }).notNull().default(""),
  sector: varchar("sector", { length: 120 }).notNull().default(""),
  stage: varchar("stage", { length: 120 }).notNull().default(""),
  location: varchar("location", { length: 160 }).notNull().default(""),
  directoryListed: boolean("directoryListed").notNull().default(false),
  sourceSubmittedAt: timestamp("sourceSubmittedAt"),
  sources: text("sources").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CommunityProfile = typeof communityProfiles.$inferSelect;
export type InsertCommunityProfile = typeof communityProfiles.$inferInsert;

/** Audit trail for completed Partner Team CSV refreshes. Raw files remain private. */
export const directoryImports = mysqlTable("directory_imports", {
  id: int("id").autoincrement().primaryKey(),
  directoryFileKey: varchar("directoryFileKey", { length: 500 }).notNull(),
  mixerFileKey: varchar("mixerFileKey", { length: 500 }).notNull(),
  giveAndGrowFileKey: varchar("giveAndGrowFileKey", { length: 500 }).notNull(),
  directoryRows: int("directoryRows").notNull(),
  mixerRows: int("mixerRows").notNull(),
  giveAndGrowRows: int("giveAndGrowRows").notNull(),
  sourceRowCount: int("sourceRowCount").notNull(),
  uniqueCommunityRecords: int("uniqueCommunityRecords").notNull(),
  duplicateRecordsCollapsed: int("duplicateRecordsCollapsed").notNull(),
  publicFounderCount: int("publicFounderCount").notNull(),
  privateDirectoryRows: int("privateDirectoryRows").notNull(),
  ventureProfiles: int("ventureProfiles").notNull(),
  sectorsRepresented: int("sectorsRepresented").notNull(),
  locationsRepresented: int("locationsRepresented").notNull(),
  importedBy: varchar("importedBy", { length: 160 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type DirectoryImport = typeof directoryImports.$inferSelect;
export type InsertDirectoryImport = typeof directoryImports.$inferInsert;
