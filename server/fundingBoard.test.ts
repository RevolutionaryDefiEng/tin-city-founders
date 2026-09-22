import { describe, expect, it } from "vitest";
import { getFundingOpportunities, getScamWatch } from "./fundingBoard";

describe("funding board data layer (seed)", () => {
  it("loads and merges curated + global opportunities", async () => {
    const list = await getFundingOpportunities();
    expect(list.length).toBeGreaterThan(250);
    expect(list.some((o) => o.source === "tcf")).toBe(true);
    expect(list.some((o) => o.source === "global")).toBe(true);
    // every row is normalized
    for (const o of list.slice(0, 20)) {
      expect(o.id).toBeTruthy();
      expect(["verified", "reported", "uncertain"]).toContain(o.confidence);
      expect(["highest", "high", "medium", "low"]).toContain(o.relevance);
    }
  });

  it("sorts a curated highest-relevance opportunity to the top", async () => {
    const list = await getFundingOpportunities();
    expect(list[0].source).toBe("tcf");
    expect(["highest", "high"]).toContain(list[0].relevance);
  });

  it("exposes the scam-watch list", async () => {
    expect((await getScamWatch()).length).toBeGreaterThan(0);
  });
});
