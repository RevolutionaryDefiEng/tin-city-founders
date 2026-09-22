import { describe, expect, it } from "vitest";
import { normalizeOpportunity } from "@shared/funding/normalize";
import { rankOpportunities } from "@shared/funding/match";
import type { RawFundingOpportunity } from "@shared/funding/types";

function raw(overrides: Partial<RawFundingOpportunity>): RawFundingOpportunity {
  return {
    opportunity: "Test Opportunity",
    provider: "Provider",
    type: "Grant",
    whatYouGet: "Some grant money",
    whoItIsFor: "Founders",
    keyEligibility: "",
    cacRequired: "Not stated",
    equityTaken: "No",
    applicationFee: "No",
    statusDeadline: "OPEN",
    officialLink: "https://example.org",
    confidence: "Verified-live",
    plateauRelevance: "HIGH",
    notes: "",
    lastChecked: "21 Sep 2026",
    ...overrides,
  };
}

describe("normalizeOpportunity", () => {
  it("does not treat 'Not stated' CAC as 'no' (word-boundary trap)", () => {
    expect(normalizeOpportunity(raw({ cacRequired: "Not stated" })).cacRequired).toBe("unknown");
    expect(normalizeOpportunity(raw({ cacRequired: "NO (verify at branch)" })).cacRequired).toBe("no");
    expect(normalizeOpportunity(raw({ cacRequired: "Yes — compulsory" })).cacRequired).toBe("yes");
  });

  it("derives relevance, confidence, equity and open/deadline", () => {
    const o = normalizeOpportunity(
      raw({
        plateauRelevance: "HIGHEST",
        confidence: "Verified-live",
        equityTaken: "Yes — equity component only",
        statusDeadline: "OPEN — DEADLINE 30 September 2026",
        type: "Loan",
      }),
    );
    expect(o.relevance).toBe("highest");
    expect(o.confidence).toBe("verified");
    expect(o.equityFree).toBe(false);
    expect(o.isOpen).toBe(true);
    expect(o.deadline).toBe("2026-09-30");
    expect(o.category).toBe("loan");
  });

  it("derives sectors and women-only / age gates", () => {
    const o = normalizeOpportunity(
      raw({
        opportunity: "GLOW Women Agri Fund",
        whoItIsFor: "Women-led agribusinesses",
        keyEligibility: "STRICT AGE 18–35. Women-owned.",
      }),
    );
    expect(o.sectors).toContain("Agritech");
    expect(o.womenOnly).toBe(true);
    expect(o.ageMin).toBe(18);
    expect(o.ageMax).toBe(35);
  });
});

describe("rankOpportunities eligibility", () => {
  it("excludes women-only when founder is not women-led, keeps with verify when unknown", () => {
    const womenOnly = normalizeOpportunity(raw({ opportunity: "GLOW", whoItIsFor: "women-led ventures" }));
    expect(rankOpportunities({ womenLed: false }, [womenOnly])).toHaveLength(0);
    const kept = rankOpportunities({ womenLed: null }, [womenOnly]);
    expect(kept).toHaveLength(1);
    expect(kept[0].toVerify.join(" ")).toMatch(/women-led/i);
  });

  it("excludes out-of-range age, verifies when age unknown", () => {
    const teen = normalizeOpportunity(raw({ opportunity: "Anzisha", keyEligibility: "AGE 15–22" }));
    expect(rankOpportunities({ age: 30 }, [teen])).toHaveLength(0);
    expect(rankOpportunities({ age: 20 }, [teen])).toHaveLength(1);
    expect(rankOpportunities({}, [teen])[0].toVerify.join(" ")).toMatch(/15–22/);
  });

  it("excludes CAC-required opportunities for unregistered founders", () => {
    const needsCac = normalizeOpportunity(raw({ cacRequired: "Yes — company registration required" }));
    expect(rankOpportunities({ cacRegistered: "no" }, [needsCac])).toHaveLength(0);
    expect(rankOpportunities({ cacRegistered: "yes" }, [needsCac])).toHaveLength(1);
  });
});

describe("rankOpportunities ranking", () => {
  it("ranks highest-relevance verified open above low-relevance uncertain", () => {
    const strong = normalizeOpportunity(
      raw({ opportunity: "BOI Plateau Fund", plateauRelevance: "HIGHEST", confidence: "Verified-live", statusDeadline: "OPEN" }),
    );
    const weak = normalizeOpportunity(
      raw({ opportunity: "Far Away Grant", plateauRelevance: "LOW", confidence: "Uncertain", statusDeadline: "MONITOR", source: "global" }),
    );
    const out = rankOpportunities({}, [weak, strong]);
    expect(out[0].opportunity.opportunity).toBe("BOI Plateau Fund");
    expect(out[0].score).toBeGreaterThan(out[1].score);
  });

  it("boosts a sector match and reports why", () => {
    const agri = normalizeOpportunity(raw({ opportunity: "Agri Grant", whoItIsFor: "agritech founders" }));
    const other = normalizeOpportunity(raw({ opportunity: "Generic Grant", whoItIsFor: "fintech founders" }));
    const out = rankOpportunities({ sector: "Agritech" }, [other, agri]);
    expect(out[0].opportunity.opportunity).toBe("Agri Grant");
    expect(out[0].reasons.join(" ")).toMatch(/sector/i);
  });
});
