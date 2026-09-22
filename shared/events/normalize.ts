/**
 * Pure normalizer that turns a raw seed/CSV row into a typed TcfEvent.
 * No IO — shared by the server loader and any tests.
 */
import type { TcfEvent } from "./types";

export function slugify(input: string): string {
  return (
    input
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "event"
  );
}

export function normalizeEvent(raw: Record<string, unknown>): TcfEvent {
  const toStr = (v: unknown) => (v == null ? "" : String(v).trim());
  const toArr = (v: unknown): string[] =>
    Array.isArray(v)
      ? v.map((x) => String(x).trim()).filter(Boolean)
      : toStr(v)
          .split(/[;,]/)
          .map((x) => x.trim())
          .filter(Boolean);
  const count = Number(raw.participantCount ?? raw.participants);
  return {
    id: toStr(raw.id) || slugify(toStr(raw.title)),
    title: toStr(raw.title),
    date: toStr(raw.date),
    location: toStr(raw.location),
    participantCount: Number.isFinite(count) && count > 0 ? count : null,
    sectors: toArr(raw.sectors),
    partners: toArr(raw.partners),
    summary: toStr(raw.summary),
    outcome: toStr(raw.outcome),
    photoUrl: toStr(raw.photoUrl),
  };
}
