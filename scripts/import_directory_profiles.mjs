import { readFile } from "node:fs/promises";
import mysql from "mysql2/promise";

const profileFile = "/home/ubuntu/directory_consolidated_profiles.json";
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required to import the consolidated directory profiles.");
}

const profiles = JSON.parse(await readFile(profileFile, "utf8"));
const connection = await mysql.createConnection(databaseUrl);

try {
  await connection.beginTransaction();
  for (const profile of profiles) {
    await connection.execute(
      `INSERT INTO community_profiles
        (profileKey, canonicalName, email, phone, ventureName, sector, stage, location, directoryListed, sources)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
        canonicalName = VALUES(canonicalName),
        email = VALUES(email),
        phone = VALUES(phone),
        ventureName = VALUES(ventureName),
        sector = VALUES(sector),
        stage = VALUES(stage),
        location = VALUES(location),
        directoryListed = VALUES(directoryListed),
        sources = VALUES(sources)`,
      [
        profile.profileKey,
        profile.canonicalName,
        profile.email || null,
        profile.phone || null,
        profile.ventureName,
        profile.sector,
        profile.stage,
        profile.location,
        profile.directoryListed,
        profile.sources,
      ],
    );
  }
  await connection.commit();
  console.log(JSON.stringify({ importedProfiles: profiles.length }));
} catch (error) {
  await connection.rollback();
  throw error;
} finally {
  await connection.end();
}

