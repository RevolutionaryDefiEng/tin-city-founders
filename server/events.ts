/**
 * Events archive data layer. Source of truth is the committed seed JSON; when an
 * EVENTS_CSV_URL ("Publish to web" CSV) is provided it syncs live and falls back
 * to the seed/cache on any failure — mirroring the directory-stats resilience.
 */
import { parse } from "csv-parse/sync";
import { normalizeEvent } from "@shared/events/normalize";
import type { TcfEvent } from "@shared/events/types";
import eventsSeed from "./data/events.seed.json";

const CACHE_MS = 10 * 60_000;
const FETCH_TIMEOUT_MS = 12_000;
const EVENTS_CSV_URL = process.env.EVENTS_CSV_URL ?? "";

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const t = setTimeout(() => reject(new Error("request timed out")), ms);
    p.then(resolve, reject).finally(() => clearTimeout(t));
  });
}

const seedEvents = (): TcfEvent[] =>
  (eventsSeed as Array<Record<string, unknown>>).map(normalizeEvent);

let cache: { value: TcfEvent[]; at: number } | null = null;

export async function getEvents(): Promise<TcfEvent[]> {
  if (!EVENTS_CSV_URL) return seedEvents();
  try {
    const res = await withTimeout(fetch(EVENTS_CSV_URL), FETCH_TIMEOUT_MS);
    if (!res.ok) throw new Error(`CSV fetch failed: ${res.status}`);
    const rows = parse(await res.text(), {
      bom: true,
      columns: true,
      skip_empty_lines: true,
      trim: true,
      relax_column_count: true,
    }) as Array<Record<string, unknown>>;
    const value = rows.map(normalizeEvent).filter((e) => e.title);
    cache = { value, at: Date.now() };
    return value;
  } catch (error) {
    console.error("[Events] live load failed, using cache/seed:", error);
    if (cache && Date.now() - cache.at <= CACHE_MS) return cache.value;
    return seedEvents();
  }
}
