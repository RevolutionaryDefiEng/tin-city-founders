import { describe, expect, it } from "vitest";
import { heroCopy } from "./brandCopy";

describe("Tin City Founders hero narrative", () => {
  it("centers mutual community contribution and a grounded partner value proposition", () => {
    expect(heroCopy.lead).toContain("No founder should build alone");
    expect(heroCopy.emphasis).toContain("Give before you take");
    expect(heroCopy.deck).toContain("trusted room for builders");
    expect(heroCopy.deck).toContain("grounded way to strengthen the local conditions");
  });
});
