/**
 * Shared types for the Tin City Founders funding board + matcher.
 * Used by the server (data sync) and the client (board UI + matcher) so both
 * sides agree on the shape, and by the vitest unit tests.
 */

/** Raw row as stored in the seed JSON / published Google Sheet CSV. */
export type RawFundingOpportunity = {
  num?: string;
  opportunity: string;
  provider: string;
  type: string;
  whatYouGet: string;
  whoItIsFor: string;
  keyEligibility: string;
  cacRequired: string;
  equityTaken: string;
  applicationFee: string;
  statusDeadline: string;
  officialLink: string;
  confidence: string;
  plateauRelevance: string;
  notes: string;
  lastChecked: string;
  /** "tcf" = hand-curated Jos/Plateau board; "global" = broader database. */
  source?: string;
  /** Geography label (used by the global database sheet). */
  geography?: string;
};

/** Where an opportunity came from — used for badging + ranking priority. */
export type FundingSource = "tcf" | "global";

export type Confidence = "verified" | "reported" | "uncertain";
export type Relevance = "highest" | "high" | "medium" | "low";
export type YesNoUnknown = "yes" | "no" | "unknown";

/** High-level grouping of the many free-text "Type" values, for filtering. */
export type FundingCategory =
  | "grant"
  | "loan"
  | "equity"
  | "training"
  | "accelerator"
  | "fellowship"
  | "prize"
  | "other";

/** Canonical sectors — aligned with the directory form's Sector options. */
export const CANONICAL_SECTORS = [
  "Agritech",
  "Tech / Software",
  "Fintech",
  "Creative / Media",
  "Commerce / Retail",
  "Hospitality / Food",
  "Education",
  "Other",
] as const;
export type Sector = (typeof CANONICAL_SECTORS)[number];

/** Normalized, derived opportunity the UI and matcher consume. */
export type FundingOpportunity = {
  id: string;
  opportunity: string;
  provider: string;
  type: string;
  category: FundingCategory;
  whatYouGet: string;
  whoItIsFor: string;
  keyEligibility: string;
  statusDeadline: string;
  officialLink: string;
  notes: string;
  lastChecked: string;
  confidence: Confidence;
  relevance: Relevance;
  cacRequired: YesNoUnknown;
  equityFree: boolean;
  feeFree: YesNoUnknown;
  isOpen: boolean;
  /** ISO date (yyyy-mm-dd) parsed best-effort from statusDeadline, else null. */
  deadline: string | null;
  /** Derived sector tags; empty array means sector-agnostic. */
  sectors: Sector[];
  /** Whether the opportunity is explicitly restricted to women-led ventures. */
  womenOnly: boolean;
  /** Age gate parsed from eligibility, if any. */
  ageMin: number | null;
  ageMax: number | null;
  /** Requires an existing paying customer / traction. */
  needsPayingCustomer: boolean;
  /** Provenance: hand-curated Jos board vs the broader global database. */
  source: FundingSource;
  /** Geography label, e.g. "Jos / Plateau, Nigeria" or "Global". */
  geography: string;
};

export type ScamWatchEntry = {
  whatYouWillSee: string;
  whyProblem: string;
  whatToDoInstead: string;
};

export type TcfEvent = {
  id: string;
  title: string;
  /** yyyy-mm or yyyy-mm-dd */
  date: string;
  location: string;
  participantCount: number | null;
  sectors: string[];
  partners: string[];
  summary: string;
  outcome: string;
  photoUrl: string;
};

/** Founder self-select inputs for the "find your matches" panel. */
export type MatchInput = {
  sector?: Sector | "";
  stage?: string;
  need?: "funding" | "training" | "customers" | "mentorship" | "";
  /** Founder's age, if they choose to share it. */
  age?: number | null;
  /** Whether the founder is CAC-registered. */
  cacRegistered?: YesNoUnknown;
  /** Whether the venture is women-led. */
  womenLed?: boolean | null;
};

export type RankedOpportunity = {
  opportunity: FundingOpportunity;
  score: number;
  reasons: string[];
  toVerify: string[];
};
