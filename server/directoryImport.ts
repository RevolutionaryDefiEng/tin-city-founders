import { createHash, randomUUID } from "node:crypto";
import { parse } from "csv-parse/sync";
import { z } from "zod";
import { InsertCommunityProfile } from "../drizzle/schema";
import { getLatestDirectoryImport, replaceCommunityProfilesAndRecordImport } from "./db";
import { storagePut } from "./storage";

const MAX_CSV_BYTES = 1_500_000;
const directoryConsentColumn = "Can we list you in the public Built in Jos directory?";

const csvUploadSchema = z.object({
  name: z.string().trim().min(1).max(160).refine((value) => value.toLowerCase().endsWith(".csv"), "Upload a CSV file."),
  content: z.string().min(1).max(MAX_CSV_BYTES, "Each CSV must be 1.5 MB or smaller."),
});

export const directoryCsvRefreshSchema = z.object({
  directory: csvUploadSchema,
  mixer: csvUploadSchema,
  giveAndGrow: csvUploadSchema,
});

export type DirectoryCsvRefreshInput = z.infer<typeof directoryCsvRefreshSchema>;

type CsvRow = Record<string, string>;
type SourceName = "directory" | "mixer" | "give_and_grow";

type ImportRecord = {
  source: SourceName;
  displayName: string;
  name: string;
  rawEmail: string;
  email: string;
  rawPhone: string;
  phone: string;
  ventureName: string;
  sector: string;
  stage: string;
  location: string;
  directoryListed: boolean;
  sourceSubmittedAt: Date | null;
};

function text(value: unknown) {
  return String(value ?? "").trim();
}

function normalizeEmail(value: unknown) {
  return text(value).toLowerCase();
}

function normalizePhone(value: unknown) {
  const digits = text(value).replace(/\D+/g, "");
  return digits.startsWith("234") && digits.length === 13 ? `0${digits.slice(3)}` : digits;
}

function normalizeName(value: unknown) {
  return text(value).toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function parseSubmittedAt(value: unknown) {
  const submittedAt = new Date(text(value));
  return Number.isNaN(submittedAt.getTime()) ? null : submittedAt;
}

function safeFileName(name: string) {
  return name.replace(/[^a-z0-9._-]+/gi, "-").replace(/^-+|-+$/g, "") || "directory-export.csv";
}

function readCsv(content: string, requiredColumns: string[], label: string): CsvRow[] {
  let rows: CsvRow[];
  try {
    rows = parse(content, {
      bom: true,
      columns: true,
      skip_empty_lines: true,
      trim: true,
      relax_column_count: true,
    }) as CsvRow[];
  } catch {
    throw new Error(`${label} could not be read as a CSV file.`);
  }

  const headers = Object.keys(rows[0] ?? {});
  const missing = requiredColumns.filter((column) => !headers.includes(column));
  if (missing.length) {
    throw new Error(`${label} is missing the required column${missing.length > 1 ? "s" : ""}: ${missing.join(", ")}.`);
  }
  return rows;
}

function unionFind(records: ImportRecord[]) {
  const parent = records.map((_, index) => index);
  const find = (index: number): number => {
    while (parent[index] !== index) {
      parent[index] = parent[parent[index]];
      index = parent[index];
    }
    return index;
  };
  const union = (left: number, right: number) => {
    const leftRoot = find(left);
    const rightRoot = find(right);
    if (leftRoot !== rightRoot) parent[rightRoot] = leftRoot;
  };
  const seen = new Map<string, number>();

  records.forEach((record, index) => {
    const keys = [record.email && `email:${record.email}`, record.phone && `phone:${record.phone}`].filter(Boolean) as string[];
    if (!keys.length && record.name) keys.push(`name:${record.name}`);
    keys.forEach((key) => {
      const match = seen.get(key);
      if (match === undefined) seen.set(key, index);
      else union(index, match);
    });
  });

  const groups = new Map<number, ImportRecord[]>();
  records.forEach((record, index) => {
    const root = find(index);
    groups.set(root, [...(groups.get(root) ?? []), record]);
  });
  return Array.from(groups.values());
}

export function prepareDirectoryCsvImport(input: DirectoryCsvRefreshInput) {
  const directoryRows = readCsv(
    input.directory.content,
    ["Timestamp", "Your name", "Startup / venture name", "Sector", "Stage", "Contact — WhatsApp or phone", "Where are you based?", directoryConsentColumn],
    "Built In Jos directory CSV",
  );
  const guestColumns = ["name", "email", "phone_number"];
  const mixerRows = readCsv(input.mixer.content, guestColumns, "Mixer guest CSV");
  const giveAndGrowRows = readCsv(input.giveAndGrow.content, guestColumns, "Give & Grow guest CSV");

  const records: ImportRecord[] = [
    ...directoryRows.map((row) => ({
      source: "directory" as const,
      displayName: text(row["Your name"]),
      name: normalizeName(row["Your name"]),
      rawEmail: "",
      email: "",
      rawPhone: text(row["Contact — WhatsApp or phone"]),
      phone: normalizePhone(row["Contact — WhatsApp or phone"]),
      ventureName: text(row["Startup / venture name"]),
      sector: text(row["Sector"]),
      stage: text(row["Stage"]),
      location: text(row["Where are you based?"]),
      directoryListed: text(row[directoryConsentColumn]).toLowerCase().startsWith("yes"),
      sourceSubmittedAt: parseSubmittedAt(row.Timestamp),
    })),
    ...mixerRows.map((row) => ({
      source: "mixer" as const,
      displayName: text(row.name),
      name: normalizeName(row.name),
      rawEmail: text(row.email),
      email: normalizeEmail(row.email),
      rawPhone: text(row.phone_number),
      phone: normalizePhone(row.phone_number),
      ventureName: "",
      sector: "",
      stage: "",
      location: "",
      directoryListed: false,
      sourceSubmittedAt: null,
    })),
    ...giveAndGrowRows.map((row) => ({
      source: "give_and_grow" as const,
      displayName: text(row.name),
      name: normalizeName(row.name),
      rawEmail: text(row.email),
      email: normalizeEmail(row.email),
      rawPhone: text(row.phone_number),
      phone: normalizePhone(row.phone_number),
      ventureName: "",
      sector: "",
      stage: "",
      location: "",
      directoryListed: false,
      sourceSubmittedAt: null,
    })),
  ];

  const groups = unionFind(records);
  const profiles: InsertCommunityProfile[] = groups.map((group: ImportRecord[]) => {
    const directoryRecord = group.find((record: ImportRecord) => record.source === "directory");
    const preferred = directoryRecord ?? group[0];
    const sourceSubmittedAt = group
      .map((record: ImportRecord) => record.sourceSubmittedAt)
      .filter((value): value is Date => value !== null)
      .sort((left, right) => right.getTime() - left.getTime())[0] ?? null;
    const identity = [
      group.find((record: ImportRecord) => record.email)?.email,
      group.find((record: ImportRecord) => record.phone)?.phone,
      preferred.name,
    ].filter(Boolean).join("|");
    return {
      profileKey: createHash("sha256").update(identity).digest("hex"),
      canonicalName: group.find((record: ImportRecord) => record.displayName)?.displayName || "Community profile",
      email: group.find((record: ImportRecord) => record.rawEmail)?.rawEmail || null,
      phone: group.find((record: ImportRecord) => record.rawPhone)?.rawPhone || null,
      ventureName: preferred.ventureName,
      sector: preferred.sector,
      stage: preferred.stage,
      location: preferred.location,
      directoryListed: group.some((record: ImportRecord) => record.directoryListed),
      sourceSubmittedAt,
      sources: Array.from(new Set<SourceName>(group.map((record: ImportRecord) => record.source))).sort().join(","),
    };
  });

  const publicProfiles = profiles.filter((profile) => profile.directoryListed);
  const summary = {
    directoryRows: directoryRows.length,
    mixerRows: mixerRows.length,
    giveAndGrowRows: giveAndGrowRows.length,
    sourceRowCount: records.length,
    uniqueCommunityRecords: profiles.length,
    duplicateRecordsCollapsed: records.length - profiles.length,
    publicFounderCount: publicProfiles.length,
    privateDirectoryRows: directoryRows.filter((row) => !text(row[directoryConsentColumn]).toLowerCase().startsWith("yes")).length,
    ventureProfiles: publicProfiles.filter((profile) => profile.ventureName).length,
    sectorsRepresented: new Set(publicProfiles.map((profile) => (profile.sector ?? "").toLowerCase()).filter(Boolean)).size,
    locationsRepresented: new Set(publicProfiles.map((profile) => (profile.location ?? "").toLowerCase()).filter(Boolean)).size,
  };

  return { profiles, summary };
}

export async function refreshDirectoryFromCsv(input: DirectoryCsvRefreshInput, importedBy: string) {
  const prepared = prepareDirectoryCsvImport(input);
  const batch = `directory-imports/${new Date().toISOString().slice(0, 10)}/${randomUUID()}`;
  const [directoryFile, mixerFile, giveAndGrowFile] = await Promise.all([
    storagePut(`${batch}/${safeFileName(input.directory.name)}`, input.directory.content, "text/csv"),
    storagePut(`${batch}/${safeFileName(input.mixer.name)}`, input.mixer.content, "text/csv"),
    storagePut(`${batch}/${safeFileName(input.giveAndGrow.name)}`, input.giveAndGrow.content, "text/csv"),
  ]);

  await replaceCommunityProfilesAndRecordImport(prepared.profiles, {
    ...prepared.summary,
    directoryFileKey: directoryFile.key,
    mixerFileKey: mixerFile.key,
    giveAndGrowFileKey: giveAndGrowFile.key,
    importedBy: importedBy.slice(0, 160) || "Partner Team",
  });

  return { ...prepared.summary, uploadedFiles: 3 };
}

export async function latestDirectoryImportSummary() {
  return getLatestDirectoryImport();
}
