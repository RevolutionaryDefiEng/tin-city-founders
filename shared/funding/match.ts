/**
 * Deterministic, explainable funding matcher.
 * Stage 1: conservative hard-eligibility filter (never exclude on an unknown —
 * surface it as something to verify instead).
 * Stage 2: weighted relevance score with human-readable reasons.
 * No LLM, no network — pure and unit-tested so matches are auditable and safe.
 */
import type { FundingOpportunity, MatchInput, RankedOpportunity } from "./types";

const RELEVANCE_SCORE = { highest: 40, high: 25, medium: 10, low: 0 } as const;
const CONFIDENCE_SCORE = { verified: 15, reported: 6, uncertain: -12 } as const;
const CLOSING_SOON_DAYS = 45;

function daysBetween(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / 86_400_000);
}

function moneyLike(o: FundingOpportunity): boolean {
  return /grant|loan|prize|cash|seed|fund|₦|\$|us\$|investment|capital|award|financing|guarantee/i.test(
    `${o.type} ${o.whatYouGet}`,
  );
}

function trainingLike(o: FundingOpportunity): boolean {
  return (
    o.category === "training" ||
    o.category === "accelerator" ||
    o.category === "fellowship" ||
    /training|mentor|bootcamp|incubat|curriculum|coaching|masterclass/i.test(`${o.type} ${o.whatYouGet}`)
  );
}

function marketLike(o: FundingOpportunity): boolean {
  return /market access|customers?|distribution|buyers|offtake|export/i.test(
    `${o.whatYouGet} ${o.whoItIsFor}`,
  );
}

const EARLY_STAGE = /idea|concept|pre-?launch|pre-?seed|student|exploring|no business needed|early|youth|aspiring/i;
const GROWTH_STAGE = /growth|scal|revenue|traction|established|expansion|series|paying customer/i;

/**
 * Rank opportunities for a founder's self-selected inputs.
 * Returns eligible opportunities sorted best-first, each with reasons + toVerify.
 */
export function rankOpportunities(
  input: MatchInput,
  opportunities: FundingOpportunity[],
  now: Date = new Date(),
): RankedOpportunity[] {
  const ranked: RankedOpportunity[] = [];

  for (const o of opportunities) {
    const reasons: string[] = [];
    const toVerify: string[] = [];

    // ---- Stage 1: hard eligibility (conservative) ----
    if (o.womenOnly) {
      if (input.womenLed === false) continue; // definitively ineligible
      if (input.womenLed == null) toVerify.push("Restricted to women-led ventures — confirm this applies to you.");
    }
    if (o.ageMin != null && o.ageMax != null) {
      if (input.age != null) {
        if (input.age < o.ageMin || input.age > o.ageMax) continue;
      } else {
        toVerify.push(`Age limit ${o.ageMin}–${o.ageMax} applies.`);
      }
    }
    if (o.cacRequired === "yes") {
      if (input.cacRegistered === "no") continue; // can't apply unregistered
      if (input.cacRegistered !== "yes") toVerify.push("CAC registration is required.");
    }
    if (o.needsPayingCustomer) toVerify.push("Expects existing traction / a paying customer.");
    if (o.confidence === "uncertain") toVerify.push("Listing status is uncertain — verify on the official site before applying.");

    // ---- Stage 2: weighted score ----
    let score = 0;

    score += RELEVANCE_SCORE[o.relevance];
    if (o.relevance === "highest") reasons.push("Highest relevance to Jos & Plateau");
    else if (o.relevance === "high") reasons.push("High relevance to Nigeria/Plateau");

    score += CONFIDENCE_SCORE[o.confidence];
    if (o.confidence === "verified") reasons.push("Verified live");

    if (o.source === "tcf") score += 8; // hand-curated local board is prioritised

    if (o.isOpen) {
      score += 15;
      reasons.push("Open now");
    }
    if (o.deadline) {
      const d = new Date(o.deadline);
      const left = daysBetween(now, d);
      if (left < 0) {
        score -= 40;
        toVerify.push("Deadline may have passed — verify the current cycle.");
      } else if (left <= CLOSING_SOON_DAYS) {
        score += 12;
        reasons.push(`Closing soon (~${left} day${left === 1 ? "" : "s"})`);
      }
    }

    if (input.sector) {
      if (o.sectors.includes(input.sector)) {
        score += 20;
        reasons.push(`Matches your sector (${input.sector})`);
      } else if (o.sectors.length === 0) {
        score += 8;
        reasons.push("Open to all sectors");
      }
    }

    if (input.need === "funding" && moneyLike(o)) {
      score += 14;
      reasons.push("Provides funding");
    } else if (input.need === "training" && trainingLike(o)) {
      score += 14;
      reasons.push("Provides training / mentorship");
    } else if (input.need === "customers" && marketLike(o)) {
      score += 12;
      reasons.push("Opens market access");
    } else if (input.need === "mentorship" && trainingLike(o)) {
      score += 12;
      reasons.push("Includes mentorship");
    }

    if (o.equityFree) {
      score += 5;
      reasons.push("Equity-free");
    }
    if (o.cacRequired === "no") {
      score += 6;
      reasons.push("No CAC registration needed");
    }
    if (o.feeFree === "yes") {
      score += 4;
      reasons.push("No application fee");
    }

    if (input.stage) {
      const blob = `${o.whoItIsFor} ${o.keyEligibility} ${o.type}`;
      const early = /student|exploring|building|pre-launch/i.test(input.stage);
      const growth = /growing|established|launched|traction/i.test(input.stage);
      if (early && EARLY_STAGE.test(blob)) {
        score += 8;
        reasons.push("Fits your stage");
      } else if (growth && GROWTH_STAGE.test(blob)) {
        score += 8;
        reasons.push("Fits your stage");
      }
    }

    ranked.push({ opportunity: o, score, reasons: dedupe(reasons), toVerify: dedupe(toVerify) });
  }

  ranked.sort(
    (a, b) =>
      b.score - a.score ||
      RELEVANCE_SCORE[b.opportunity.relevance] - RELEVANCE_SCORE[a.opportunity.relevance] ||
      CONFIDENCE_SCORE[b.opportunity.confidence] - CONFIDENCE_SCORE[a.opportunity.confidence] ||
      a.opportunity.opportunity.localeCompare(b.opportunity.opportunity),
  );
  return ranked;
}

function dedupe(items: string[]): string[] {
  return Array.from(new Set(items));
}
