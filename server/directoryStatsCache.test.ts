import { describe, expect, it } from "vitest";
import { createDirectoryStatsReader, type LiveDirectoryStats } from "./db";

const stats: LiveDirectoryStats = {
  directoryResponses: 36,
  publicFounderCount: 31,
  ventureProfiles: 30,
  sectorsRepresented: 7,
  locationsRepresented: 4,
  recentFounders: [],
};

describe("directory statistics resilience", () => {
  it("serves recent cached statistics when a refresh transiently fails", async () => {
    let now = 1_000;
    let shouldFail = false;
    const read = createDirectoryStatsReader(
      async () => {
        if (shouldFail) throw new Error("temporary database interruption");
        return stats;
      },
      () => now,
      100,
      1_000,
    );

    await expect(read()).resolves.toEqual(stats);
    now += 500;
    shouldFail = true;
    await expect(read()).resolves.toEqual(stats);
  });

  it("does not present stale statistics after the cache window expires", async () => {
    let now = 1_000;
    let shouldFail = false;
    const read = createDirectoryStatsReader(
      async () => {
        if (shouldFail) throw new Error("temporary database interruption");
        return stats;
      },
      () => now,
      100,
      1_000,
    );

    await read();
    now += 1_001;
    shouldFail = true;
    await expect(read()).rejects.toThrow("temporary database interruption");
  });
});

