import { and, desc, eq, like, or, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertPartnerEnquiry, InsertUser, partnerEnquiries, users } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

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
