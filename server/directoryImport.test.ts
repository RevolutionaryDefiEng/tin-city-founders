import { describe, expect, it } from "vitest";
import { prepareDirectoryCsvImport } from "./directoryImport";

const directoryHeader = "Timestamp,Your name,Startup / venture name,Sector,Stage,Contact — WhatsApp or phone,Where are you based?,Can we list you in the public Built in Jos directory?";

describe("directory CSV consolidation", () => {
  it("validates the three source exports, merges repeat people, and keeps public statistics consent-safe", () => {
    const result = prepareDirectoryCsvImport({
      directory: {
        name: "built-in-jos.csv",
        content: `${directoryHeader}\n2026-08-01,Ada Founder,Ada Labs,Tech / Software,Launched / early traction,08010000001,Jos,Yes — list me\n2026-08-02,Bola Builder,Bola Foods,Hospitality / Food,Building / pre-launch,08010000002,Jos,Keep me private (community only)`,
      },
      mixer: {
        name: "mixer.csv",
        content: "name,email,phone_number\nAda Founder,ada@example.com,08010000001\nChidi Creator,chidi@example.com,08010000003",
      },
      giveAndGrow: {
        name: "give-grow.csv",
        content: "name,email,phone_number\nChidi Creator,chidi@example.com,08010000003",
      },
    });

    expect(result.summary).toMatchObject({
      directoryRows: 2,
      mixerRows: 2,
      giveAndGrowRows: 1,
      sourceRowCount: 5,
      uniqueCommunityRecords: 3,
      duplicateRecordsCollapsed: 2,
      publicFounderCount: 1,
      privateDirectoryRows: 1,
      ventureProfiles: 1,
      sectorsRepresented: 1,
      locationsRepresented: 1,
    });
    expect(result.profiles).toHaveLength(3);
    const publicProfile = result.profiles.find((profile) => profile.directoryListed);
    expect(publicProfile?.canonicalName).toBe("Ada Founder");
    expect(publicProfile?.sourceSubmittedAt).toBeInstanceOf(Date);
  });

  it("rejects an export when its expected columns are missing", () => {
    expect(() => prepareDirectoryCsvImport({
      directory: { name: "built-in-jos.csv", content: "Name,Phone\nAda,08010000001" },
      mixer: { name: "mixer.csv", content: "name,email,phone_number\nAda,ada@example.com,08010000001" },
      giveAndGrow: { name: "give-grow.csv", content: "name,email,phone_number\nAda,ada@example.com,08010000001" },
    })).toThrow("Built In Jos directory CSV is missing the required columns");
  });
});
