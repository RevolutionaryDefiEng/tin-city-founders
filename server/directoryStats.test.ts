import { describe, expect, it } from "vitest";

type DirectoryStatsResponse = {
  directoryResponses: number;
  publicFounderCount: number;
  ventureProfiles: number;
  sectorsRepresented: number;
  locationsRepresented: number;
  updatedAt: Date;
};

describe("public directory statistics response", () => {
  it("contains aggregate directory values only and does not expose founder contact details", () => {
    const response: DirectoryStatsResponse = {
      directoryResponses: 36,
      publicFounderCount: 31,
      ventureProfiles: 30,
      sectorsRepresented: 7,
      locationsRepresented: 4,
      updatedAt: new Date("2026-08-21T00:00:00.000Z"),
    };

    expect(response).toMatchObject({
      directoryResponses: 36,
      publicFounderCount: 31,
      ventureProfiles: 30,
      sectorsRepresented: 7,
      locationsRepresented: 4,
    });
    expect(response).not.toHaveProperty("email");
    expect(response).not.toHaveProperty("phone");
  });
});
