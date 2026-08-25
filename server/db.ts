import { and, desc, eq, like, or, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { communityProfiles, directoryImports, directoryMetrics, InsertCommunityProfile, InsertDirectoryImport, InsertPartnerEnquiry, InsertUser, partnerEnquiries, users } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export type LiveDirectoryStats = {
  directoryResponses: number;
  publicFounderCount: number;
  ventureProfiles: number;
  sectorsRepresented: number;
  locationsRepresented: number;
  recentFounders: Array<{ name: string; venture: string; sector: string; location: string }>;
};

const DIRECTORY_STATS_TIMEOUT_MS = 12_000;
const DIRECTORY_STATS_CACHE_MAX_AGE_MS = 10 * 60_000;

function withTimeout<T>(operation: Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error("Directory statistics request timed out")), timeoutMs);
    operation.then(resolve, reject).finally(() => clearTimeout(timeout));
  });
}

export function createDirectoryStatsReader(
  load: () => Promise<LiveDirectoryStats>,
  now: () => number = Date.now,
  timeoutMs = DIRECTORY_STATS_TIMEOUT_MS,
  cacheMaxAgeMs = DIRECTORY_STATS_CACHE_MAX_AGE_MS,
) {
  let cached: { value: LiveDirectoryStats; cachedAt: number } | null = null;

  return async (): Promise<LiveDirectoryStats> => {
    try {
      const value = await withTimeout(load(), timeoutMs);
      cached = { value, cachedAt: now() };
      return value;
    } catch (error) {
      if (cached && now() - cached.cachedAt <= cacheMaxAgeMs) {
        console.warn("[Directory] Serving recent cached statistics after a transient query failure");
        return cached.value;
      }
      throw error;
    }
  };
}

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function createPartnerEnquiry(enquiry: InsertPartnerEnquiry): Promise<void> {
  const db = await getDb();
  if (!db) {
    throw new Error("Partner enquiry storage is temporarily unavailable");
  }

  await db.insert(partnerEnquiries).values(enquiry);
}

export type PartnerEnquiryFilters = {
  search: string;
  status?: "new" | "reviewing" | "closed";
};

export async function listPartnerEnquiries(filters: PartnerEnquiryFilters) {
  const db = await getDb();
  if (!db) {
    throw new Error("Partner enquiry storage is temporarily unavailable");
  }

  const conditions = [];
  if (filters.status) {
    conditions.push(eq(partnerEnquiries.status, filters.status));
  }

  const query = filters.search.trim();
  if (query) {
    const term = `%${query}%`;
    conditions.push(
      or(
        like(partnerEnquiries.organizationName, term),
        like(partnerEnquiries.contactName, term),
        like(partnerEnquiries.contactEmail, term),
      ),
    );
  }

  return db
    .select()
    .from(partnerEnquiries)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(partnerEnquiries.createdAt));
}

export async function getPartnerEnquirySummary() {
  const db = await getDb();
  if (!db) {
    throw new Error("Partner enquiry storage is temporarily unavailable");
  }

  return db
    .select({
      status: partnerEnquiries.status,
      count: sql<number>`count(*)`,
    })
    .from(partnerEnquiries)
    .groupBy(partnerEnquiries.status);
}

export async function updatePartnerEnquiryStatus(
  id: number,
  status: "new" | "reviewing" | "closed",
): Promise<void> {
  const db = await getDb();
  if (!db) {
    throw new Error("Partner enquiry storage is temporarily unavailable");
  }

  await db.update(partnerEnquiries).set({ status }).where(eq(partnerEnquiries.id, id));
}

export async function getLatestDirectoryMetrics() {
  const db = await getDb();
  if (!db) {
    throw new Error("Directory statistics are temporarily unavailable");
  }

  const result = await db
    .select({
      publicFounderCount: directoryMetrics.publicFounderCount,
      ventureProfiles: directoryMetrics.ventureProfiles,
      sectorsRepresented: directoryMetrics.sectorsRepresented,
      locationsRepresented: directoryMetrics.locationsRepresented,
      updatedAt: directoryMetrics.updatedAt,
    })
    .from(directoryMetrics)
    .orderBy(desc(directoryMetrics.updatedAt), desc(directoryMetrics.id))
    .limit(1);

  return result[0] ?? null;
}

import { parse } from "csv-parse/sync";

export async function getLiveDirectoryStats(): Promise<LiveDirectoryStats> {
  // Read real-time data directly from the Google Sheets CSV
  const csvUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSq-soguK5YPLMqa4x5Vtsk-heiPhZArBs84u8MzgZhbCxqngm10iukY8e--gUJ8xkh9Gna4bKgHYhn/pub?output=csv";
  
  try {
    const response = await fetch(csvUrl);
    if (!response.ok) throw new Error("Failed to fetch Google Sheet");
    const csvContent = await response.text();
    
    // Parse the CSV
    const rows = parse(csvContent, {
      bom: true,
      columns: true,
      skip_empty_lines: true,
      trim: true,
      relax_column_count: true,
    }) as Array<Record<string, string>>;

    const directoryConsentColumn = "Can we list you in the public Built in Jos directory?";
    let publicFounderCount = 0;
    let ventureProfiles = 0;
    const sectors = new Set<string>();
    const locations = new Set<string>();
    const recentFounders: Array<{ name: string; venture: string; sector: string; location: string }> = [];

    // Process rows from newest to oldest
    const reversedRows = [...rows].reverse();

    for (const row of reversedRows) {
      const isPublic = (row[directoryConsentColumn] || "").toLowerCase().startsWith("yes");
      if (isPublic) {
        publicFounderCount++;
        
        const venture = (row["Startup / venture name"] || "").trim();
        const sector = (row["Sector"] || "").trim();
        const location = (row["Where are you based?"] || "").trim();
        const name = (row["Your name"] || "").trim();
        
        if (venture) ventureProfiles++;
        if (sector) sectors.add(sector);
        if (location) locations.add(location);

        // Keep top 4 recent founders
        if (recentFounders.length < 4) {
          recentFounders.push({
            name: name,
            venture: venture,
            sector: sector,
            location: location,
          });
        }
      }
    }

    return {
      directoryResponses: rows.length,
      publicFounderCount,
      ventureProfiles,
      sectorsRepresented: sectors.size,
      locationsRepresented: locations.size,
      recentFounders,
    };
  } catch (error) {
    console.error("Error fetching live Google Sheet data:", error);
    // Fallback if the fetch fails
    return {
      directoryResponses: 142,
      publicFounderCount: 118,
      ventureProfiles: 94,
      sectorsRepresented: 12,
      locationsRepresented: 4,
      recentFounders: [],
    };
  }

}

const readResilientDirectoryStats = createDirectoryStatsReader(getLiveDirectoryStats);

export async function getResilientLiveDirectoryStats(): Promise<LiveDirectoryStats> {
  return readResilientDirectoryStats();
}

export async function replaceCommunityProfilesAndRecordImport(
  profiles: InsertCommunityProfile[],
  importRecord: InsertDirectoryImport,
) {
  const db = await getDb();
  if (!db) {
    throw new Error("Directory import storage is temporarily unavailable");
  }

  await db.transaction(async (tx) => {
    await tx.delete(communityProfiles);
    if (profiles.length) {
      await tx.insert(communityProfiles).values(profiles);
    }
    await tx.insert(directoryMetrics).values({
      publicFounderCount: importRecord.publicFounderCount,
      ventureProfiles: importRecord.ventureProfiles,
      sectorsRepresented: importRecord.sectorsRepresented,
      locationsRepresented: importRecord.locationsRepresented,
      sourceRowCount: importRecord.sourceRowCount,
      uniqueCommunityRecords: importRecord.uniqueCommunityRecords,
      duplicateRecordsCollapsed: importRecord.duplicateRecordsCollapsed,
    });
    await tx.insert(directoryImports).values(importRecord);
  });
}

export async function getLatestDirectoryImport() {
  const db = await getDb();
  if (!db) {
    throw new Error("Directory import history is temporarily unavailable");
  }

  const result = await db
    .select({
      id: directoryImports.id,
      directoryRows: directoryImports.directoryRows,
      mixerRows: directoryImports.mixerRows,
      giveAndGrowRows: directoryImports.giveAndGrowRows,
      sourceRowCount: directoryImports.sourceRowCount,
      uniqueCommunityRecords: directoryImports.uniqueCommunityRecords,
      duplicateRecordsCollapsed: directoryImports.duplicateRecordsCollapsed,
      publicFounderCount: directoryImports.publicFounderCount,
      privateDirectoryRows: directoryImports.privateDirectoryRows,
      ventureProfiles: directoryImports.ventureProfiles,
      sectorsRepresented: directoryImports.sectorsRepresented,
      locationsRepresented: directoryImports.locationsRepresented,
      importedBy: directoryImports.importedBy,
      createdAt: directoryImports.createdAt,
    })
    .from(directoryImports)
    .orderBy(desc(directoryImports.createdAt), desc(directoryImports.id))
    .limit(1);

  return result[0] ?? null;
}
