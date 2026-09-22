/**
 * Funding board + events data layer.
 *
 * Source of truth is the curated seed JSON committed alongside this file (derived
 * from the Tin City Founders Funding Board + the broader global opportunities
 * database). When the corresponding "Publish to web" CSV URLs are provided via
 * env vars, we sync live and fall back to the seed on any failure — mirroring the
 * resilient pattern used for the directory stats.
 */
import { parse } from "csv-parse/sync";
import {
  normalizeEvent,
  normalizeOpportunity,
  normalizeScam,
} from "@shared/funding/normalize";
import type {
  FundingOpportunity,
  RawFundingOpportunity,
  ScamWatchEntry,
  TcfEvent,
} from "@shared/funding/types";
import tcfSeed from "./data/fundingBoard.seed.json";
import globalSeed from "./data/fundingBoardGlobal.seed.json";
import scamSeed from "./data/scamWatch.seed.json";
import eventsSeed from "./data/events.seed.json";

const RELEVANCE_RANK = { highest: 3, high: 2, medium: 1, low: 0 } as const;
const CONFIDENCE_RANK = { verified: 2, reported: 1, uncertain: 0 } as const;
const CACHE_MS = 10 * 60_000;
const FETCH_TIMEOUT_MS = 12_000;

const ENV = {
  tcfCsv: process.env.FUNDING_BOARD_CSV_URL ?? "",
  globalCsv: process.env.FUNDING_GLOBAL_CSV_URL ?? "",
  scamCsv: process.env.SCAM_WATCH_CSV_URL ?? "",
  eventsCsv: process.env.EVENTS_CSV_URL ?? "",
};

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const t = setTimeout(() => reject(new Error("request timed out")), ms);
    p.then(resolve, reject).finally(() => clearTimeout(t));
  });
}

async function fetchCsvRows(url: string): Promise<Array<Record<string, string>>> {
  const res = await withTimeout(fetch(url), FETCH_TIMEOUT_MS);
  if (!res.ok) throw new Error(`CSV fetch failed: ${res.status}`);
  const text = await res.text();
  return parse(text, {
    bom: true,
    columns: true,
    skip_empty_lines: true,
    trim: true,
    relax_column_count: true,
  }) as Array<Record<string, string>>;
}

/** Read a value by trying several candidate header names (case-insensitive). */
function pick(rec: Record<string, string>, names: string[]): string {
  const lowerMap = new Map(Object.entries(rec).map(([k, v]) => [k.toLowerCase().trim(), v]));
  for (const n of names) {
    const v = lowerMap.get(n.toLowerCase());
    if (v != null && String(v).trim()) return String(v).trim();
  }
  return "";
}

function relevanceFromGeography(geo: string): string {
  const t = geo.toLowerCase();
  if (/nigeria|plateau|jos/.test(t)) return "HIGH";
  if (/africa|ecowas|west africa|sub-saharan|emerging market/.test(t)) return "MEDIUM";
  return t ? "LOW" : "";
}

function csvRowToRaw(rec: Record<string, string>, source: "tcf" | "global"): RawFundingOpportunity {
  const geography = pick(rec, ["geography", "geo"]);
  const stage = pick(rec, ["founder stage", "stage"]);
  const fundingClass = pick(rec, ["funding class", "class"]);
  const typePlain = pick(rec, ["type"]);
  const relevance =
    pick(rec, ["jos / plateau relevance", "plateau relevance", "relevance"]) ||
    (source === "global" ? relevanceFromGeography(geography) : "");
  return {
    num: pick(rec, ["#", "num"]),
    opportunity: pick(rec, ["opportunity", "name"]),
    provider: pick(rec, ["provider", "funder", "organisation", "organization"]),
    type: [fundingClass, typePlain].filter(Boolean).join(" — ") || typePlain || fundingClass,
    whatYouGet: pick(rec, ["what you get", "funding / benefit", "funding/benefit", "benefit"]),
    whoItIsFor: [pick(rec, ["who it is for", "focus"]), stage ? `Stage: ${stage}` : ""]
      .filter(Boolean)
      .join(" · "),
    keyEligibility: [
      pick(rec, ["key eligibility", "eligibility / notes", "eligibility"]),
      geography ? `Geography: ${geography}` : "",
    ]
      .filter(Boolean)
      .join(" · "),
    cacRequired: pick(rec, ["cac required?", "cac required", "cac"]),
    equityTaken: pick(rec, ["equity taken?", "equity"]),
    applicationFee: pick(rec, ["application fee?", "application fee", "fee"]),
    statusDeadline: pick(rec, ["status / deadline", "deadline / status", "deadline", "status"]),
    officialLink: pick(rec, ["official link", "link", "url"]),
    confidence: pick(rec, ["confidence", "verification"]),
    plateauRelevance: relevance,
    notes: pick(rec, ["notes", "verification"]),
    lastChecked: pick(rec, ["last checked", "last verified"]),
    source,
    geography,
  };
}

function sortOpportunities(list: FundingOpportunity[]): FundingOpportunity[] {
  return [...list].sort(
    (a, b) =>
      RELEVANCE_RANK[b.relevance] - RELEVANCE_RANK[a.relevance] ||
      (a.source === b.source ? 0 : a.source === "tcf" ? -1 : 1) ||
      Number(b.isOpen) - Number(a.isOpen) ||
      CONFIDENCE_RANK[b.confidence] - CONFIDENCE_RANK[a.confidence] ||
      a.opportunity.localeCompare(b.opportunity),
  );
}

/** Merge tcf + global, normalize, and dedupe by opportunity name (prefer tcf). */
function assembleOpportunities(
  tcfRaw: RawFundingOpportunity[],
  globalRaw: RawFundingOpportunity[],
): FundingOpportunity[] {
  const byKey = new Map<string, FundingOpportunity>();
  for (const raw of [...tcfRaw, ...globalRaw]) {
    if (!raw.opportunity) continue;
    const o = normalizeOpportunity(raw);
    const key = o.opportunity.toLowerCase().replace(/[^a-z0-9]/g, "");
    const existing = byKey.get(key);
    // Prefer the hand-curated tcf entry over a global duplicate.
    if (!existing || (existing.source === "global" && o.source === "tcf")) byKey.set(key, o);
  }
  return sortOpportunities(Array.from(byKey.values()));
}

function createReader<T>(load: () => Promise<T>, seed: () => T) {
  let cache: { value: T; at: number } | null = null;
  return async (): Promise<T> => {
    try {
      const value = await load();
      cache = { value, at: Date.now() };
      return value;
    } catch (error) {
      console.error("[Funding] live load failed, using cache/seed:", error);
      if (cache && Date.now() - cache.at <= CACHE_MS) return cache.value;
      return seed();
    }
  };
}

const seedOpportunities = (): FundingOpportunity[] =>
  assembleOpportunities(
    tcfSeed as RawFundingOpportunity[],
    globalSeed as RawFundingOpportunity[],
  );

const readOpportunities = createReader<FundingOpportunity[]>(async () => {
  if (!ENV.tcfCsv && !ENV.globalCsv) return seedOpportunities();
  const tcfRaw = ENV.tcfCsv
    ? (await fetchCsvRows(ENV.tcfCsv)).map((r) => csvRowToRaw(r, "tcf"))
    : (tcfSeed as RawFundingOpportunity[]);
  const globalRaw = ENV.globalCsv
    ? (await fetchCsvRows(ENV.globalCsv)).map((r) => csvRowToRaw(r, "global"))
    : (globalSeed as RawFundingOpportunity[]);
  return assembleOpportunities(tcfRaw, globalRaw);
}, seedOpportunities);

const seedScams = (): ScamWatchEntry[] =>
  (scamSeed as Array<Record<string, string>>).map(normalizeScam);

const readScams = createReader<ScamWatchEntry[]>(async () => {
  if (!ENV.scamCsv) return seedScams();
  const rows = await fetchCsvRows(ENV.scamCsv);
  return rows.map((r) => ({
    whatYouWillSee: pick(r, ["what you will see", "what you'll see", "scam"]),
    whyProblem: pick(r, ["why it is a problem", "why", "problem"]),
    whatToDoInstead: pick(r, ["what to do instead", "what to do", "instead"]),
  }));
}, seedScams);

const seedEvents = (): TcfEvent[] =>
  (eventsSeed as Array<Record<string, unknown>>).map(normalizeEvent);

const readEvents = createReader<TcfEvent[]>(async () => {
  if (!ENV.eventsCsv) return seedEvents();
  const rows = await fetchCsvRows(ENV.eventsCsv);
  return rows.map((r) => normalizeEvent(r));
}, seedEvents);

export function getFundingOpportunities(): Promise<FundingOpportunity[]> {
  return readOpportunities();
}
export function getScamWatch(): Promise<ScamWatchEntry[]> {
  return readScams();
}
export function getFundingEvents(): Promise<TcfEvent[]> {
  return readEvents();
}
