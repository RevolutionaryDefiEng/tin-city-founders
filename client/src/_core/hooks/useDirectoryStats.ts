/**
 * Fetches and parses Tin City Founders directory statistics directly from the
 * published Google Sheets CSV in the browser. This replaces the tRPC
 * `directory.stats` call which requires the Express backend (unavailable on Vercel).
 *
 * Identical column logic to server/db.ts getLiveDirectoryStats so counts match.
 * Refreshes every 5 minutes; caches the last good result across refetches.
 */
import { useEffect, useState } from "react";

const CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vSq-soguK5YPLMqa4x5Vtsk-heiPhZArBs84u8MzgZhbCxqngm10iukY8e--gUJ8xkh9Gna4bKgHYhn/pub?output=csv";

const REFRESH_INTERVAL_MS = 5 * 60_000;

export type DirectoryStats = {
  directoryResponses: number;
  publicFounderCount: number;
  ventureProfiles: number;
  sectorsRepresented: number;
  locationsRepresented: number;
  recentFounders: Array<{ name: string; venture: string; sector: string; location: string }>;
};

function parseCsv(text: string): Array<Record<string, string>> {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentCell += '"';
        i++; // skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      currentRow.push(currentCell.trim());
      currentCell = "";
    } else if ((char === '\n' || (char === '\r' && nextChar === '\n')) && !inQuotes) {
      if (char === '\r') i++; // skip \n
      currentRow.push(currentCell.trim());
      rows.push(currentRow);
      currentRow = [];
      currentCell = "";
    } else {
      currentCell += char;
    }
  }

  // Push the final cell/row if not empty
  if (currentCell || currentRow.length > 0) {
    currentRow.push(currentCell.trim());
    rows.push(currentRow);
  }

  // Filter out completely empty rows
  const validRows = rows.filter(row => row.some(cell => cell !== ""));
  if (validRows.length < 2) return [];

  const headers = validRows[0];
  return validRows.slice(1).map((row) => {
    return Object.fromEntries(headers.map((h, i) => [h, row[i] ?? ""]));
  });
}

function computeStats(rows: Array<Record<string, string>>): DirectoryStats {
  const CONSENT_COL = "Can we list you in the public Built in Jos directory?";
  let publicFounderCount = 0;
  let ventureProfiles = 0;
  const sectors = new Set<string>();
  const locations = new Set<string>();
  const recentFounders: DirectoryStats["recentFounders"] = [];

  // Process newest-first (last row = most recent submission)
  for (const row of [...rows].reverse()) {
    const isPublic = (row[CONSENT_COL] ?? "").toLowerCase().startsWith("yes");
    if (!isPublic) continue;

    publicFounderCount++;
    const name = (row["Your name"] ?? "").trim();
    const venture = (row["Startup / venture name"] ?? "").trim();
    const sector = (row["Sector"] ?? "").trim();
    const location = (row["Where are you based?"] ?? "").trim();

    if (venture) ventureProfiles++;
    if (sector) sectors.add(sector);
    if (location) locations.add(location);
    if (recentFounders.length < 4) {
      recentFounders.push({ name, venture, sector, location });
    }
  }

  return {
    directoryResponses: rows.length,
    publicFounderCount,
    ventureProfiles,
    sectorsRepresented: sectors.size,
    locationsRepresented: locations.size,
    recentFounders,
  };
}

type HookResult = {
  data: DirectoryStats | undefined;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
};

export function useDirectoryStats(): HookResult {
  const [data, setData] = useState<DirectoryStats | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setIsError(false);

    fetch(CSV_URL)
      .then((r) => {
        if (!r.ok) throw new Error(`CSV fetch failed: ${r.status}`);
        return r.text();
      })
      .then((text) => {
        if (cancelled) return;
        const rows = parseCsv(text);
        setData(computeStats(rows));
        setIsLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setIsError(true);
        setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [tick]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), REFRESH_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  return {
    data,
    isLoading,
    isError,
    refetch: () => setTick((t) => t + 1),
  };
}
