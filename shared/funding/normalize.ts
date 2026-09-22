/**
 * Pure normalizers that turn raw sheet/seed rows into the typed, derived shapes
 * the UI and matcher use. No IO here — callers pass already-parsed rows. Kept
 * pure so the server, client, and vitest tests can all share it.
 */
import {
  CANONICAL_SECTORS,
  type Confidence,
  type FundingCategory,
  type FundingOpportunity,
  type FundingSource,
  type RawFundingOpportunity,
  type Relevance,
  type ScamWatchEntry,
  type Sector,
  type TcfEvent,
  type YesNoUnknown,
} from "./types";

const MONTHS: Record<string, number> = {
  jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
  jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
};

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "opportunity";
}

function hasWord(text: string, word: string): boolean {
  return new RegExp(`\\b${word}\\b`, "i").test(text);
}

function parseConfidence(raw: string): Confidence {
  const t = raw.toLowerCase();
  if (t.includes("verified")) return "verified";
  if (t.includes("uncertain")) return "uncertain";
  return "reported";
}

function parseRelevance(raw: string): Relevance {
  const t = raw.toLowerCase();
  if (t.includes("highest")) return "highest";
  if (t.includes("high")) return "high";
  if (t.includes("medium")) return "medium";
  if (t.includes("low")) return "low";
  return "medium";
}

/** yes/no/unknown from free text, avoiding the "not"→"no" trap via word boundaries. */
function parseYesNo(raw: string): YesNoUnknown {
  const t = raw.toLowerCase();
  const yes = hasWord(t, "yes");
  const no = hasWord(t, "no");
  if (yes && !no) return "yes";
  if (no && !yes) return "no";
  return "unknown";
}

function parseEquityFree(raw: string): boolean {
  const t = raw.toLowerCase();
  if (/dilutive|equity (component|only|stake)|yes/.test(t)) return false;
  return hasWord(t, "no");
}

/** feeFree: "yes" = no application fee, "no" = a fee is charged. */
function parseFeeFree(raw: string): YesNoUnknown {
  const t = raw.toLowerCase();
  if (hasWord(t, "yes")) return "no"; // a fee is charged
  if (t.includes("free") || t.includes("none") || hasWord(t, "no")) return "yes";
  return "unknown";
}

function parseIsOpen(statusDeadline: string): boolean {
  const t = statusDeadline.toLowerCase();
  return t.includes("open") || t.includes("rolling");
}

/** Best-effort ISO date from strings like "30 September 2026" or "Nov 2026". */
export function parseDeadline(statusDeadline: string): string | null {
  const t = statusDeadline;
  const dmy = t.match(/\b(\d{1,2})\s+([A-Za-z]{3,9})\s+(\d{4})\b/);
  if (dmy) {
    const m = MONTHS[dmy[2].slice(0, 3).toLowerCase()];
    if (m) return `${dmy[3]}-${String(m).padStart(2, "0")}-${String(Number(dmy[1])).padStart(2, "0")}`;
  }
  const my = t.match(/\b([A-Za-z]{3,9})\s+(\d{4})\b/);
  if (my) {
    const m = MONTHS[my[1].slice(0, 3).toLowerCase()];
    if (m) return `${my[2]}-${String(m).padStart(2, "0")}-01`;
  }
  return null;
}

function parseCategory(type: string): FundingCategory {
  const t = type.toLowerCase();
  if (t.includes("grant")) return "grant";
  if (/loan|debt|credit|financing|equipment/.test(t)) return "loan";
  if (t.includes("equity")) return "equity";
  if (t.includes("fellowship")) return "fellowship";
  if (/accelerator|incubation/.test(t)) return "accelerator";
  if (/prize|award|competition/.test(t)) return "prize";
  if (t.includes("training")) return "training";
  return "other";
}

const SECTOR_KEYWORDS: Array<[Sector, RegExp]> = [
  ["Agritech", /\b(agri|agro|farm|poultry|livestock|crop)/i],
  ["Fintech", /\b(fintech|payments?|lending platform)/i],
  ["Tech / Software", /\b(ai|artificial intelligence|software|developer|digital|app\b|saas|blockchain|web3|stellar|deep\s?tech|hardware|iot)/i],
  ["Creative / Media", /\b(creative|media|art|film|music|fashion|content|design|storytelling)/i],
  ["Commerce / Retail", /\b(commerce|retail|trader|market\b|e-?commerce|distribution)/i],
  ["Hospitality / Food", /\b(food|agro-?processing|restaurant|hospitality|catering|culinary)/i],
  ["Education", /\b(edtech|education|school|literacy)/i],
];

function deriveSectors(blob: string): Sector[] {
  const found = new Set<Sector>();
  for (const [sector, re] of SECTOR_KEYWORDS) {
    if (re.test(blob)) found.add(sector);
  }
  return CANONICAL_SECTORS.filter((s) => found.has(s));
}

function parseWomenOnly(blob: string): boolean {
  return /women-?led|women-?owned|female founders?|for women|women only|\bglow\b/i.test(blob);
}

function parseAgeBand(blob: string): { min: number | null; max: number | null } {
  const m = blob.match(/\b(1[0-9]|[2-6][0-9])\s*[–\-]\s*(1[0-9]|[2-6][0-9])\b/);
  if (m) return { min: Number(m[1]), max: Number(m[2]) };
  return { min: null, max: null };
}

function parseNeedsPayingCustomer(blob: string): boolean {
  return /paying customer|existing customers|revenue|traction|\bmvp\b/i.test(blob);
}

export function normalizeOpportunity(raw: RawFundingOpportunity): FundingOpportunity {
  const eligibilityBlob = [raw.whoItIsFor, raw.keyEligibility, raw.opportunity, raw.notes].join(" ");
  const age = parseAgeBand(eligibilityBlob);
  const source: FundingSource = raw.source === "global" ? "global" : "tcf";
  return {
    id: `${raw.num ? raw.num + "-" : ""}${slugify(raw.opportunity)}`,
    opportunity: raw.opportunity,
    provider: raw.provider,
    type: raw.type,
    category: parseCategory(raw.type),
    whatYouGet: raw.whatYouGet,
    whoItIsFor: raw.whoItIsFor,
    keyEligibility: raw.keyEligibility,
    statusDeadline: raw.statusDeadline,
    officialLink: raw.officialLink,
    notes: raw.notes,
    lastChecked: raw.lastChecked,
    confidence: parseConfidence(raw.confidence),
    relevance: parseRelevance(raw.plateauRelevance),
    cacRequired: parseYesNo(raw.cacRequired),
    equityFree: parseEquityFree(raw.equityTaken),
    feeFree: parseFeeFree(raw.applicationFee),
    isOpen: parseIsOpen(raw.statusDeadline),
    deadline: parseDeadline(raw.statusDeadline),
    sectors: deriveSectors([raw.opportunity, raw.whoItIsFor, raw.keyEligibility, raw.type].join(" ")),
    womenOnly: parseWomenOnly(eligibilityBlob),
    ageMin: age.min,
    ageMax: age.max,
    needsPayingCustomer: parseNeedsPayingCustomer(eligibilityBlob),
    source,
    geography: raw.geography?.trim() || (source === "tcf" ? "Jos / Plateau, Nigeria" : ""),
  };
}

export function normalizeScam(raw: Record<string, string>): ScamWatchEntry {
  return {
    whatYouWillSee: raw.whatYouWillSee ?? "",
    whyProblem: raw.whyProblem ?? "",
    whatToDoInstead: raw.whatToDoInstead ?? "",
  };
}

export function normalizeEvent(raw: Record<string, unknown>): TcfEvent {
  const toStr = (v: unknown) => (v == null ? "" : String(v).trim());
  const toArr = (v: unknown): string[] =>
    Array.isArray(v)
      ? v.map((x) => String(x).trim()).filter(Boolean)
      : toStr(v).split(/[;,]/).map((x) => x.trim()).filter(Boolean);
  const count = Number(raw.participantCount);
  return {
    id: toStr(raw.id) || slugify(toStr(raw.title)),
    title: toStr(raw.title),
    date: toStr(raw.date),
    location: toStr(raw.location),
    participantCount: Number.isFinite(count) && count > 0 ? count : null,
    sectors: toArr(raw.sectors),
    partners: toArr(raw.partners),
    summary: toStr(raw.summary),
    outcome: toStr(raw.outcome),
    photoUrl: toStr(raw.photoUrl),
  };
}
