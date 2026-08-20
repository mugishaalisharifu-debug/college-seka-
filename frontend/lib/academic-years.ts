/**
 * Shared academic-year helpers.
 *
 * The school keeps using this system year after year, so every academic-year
 * selector across the dashboards must support adding the NEXT academic year
 * (e.g. 2027-2028 -> 2028-2029 -> ...). This module centralises that logic and
 * persists any newly-added years in localStorage so they survive a refresh.
 */

export const ACADEMIC_TERMS = ["Term 1", "Term 2", "Term 3"];

/** Default list shown before the user ever adds a new year. */
const DEFAULT_ACADEMIC_YEARS = [
  "2025-2026",
  "2026-2027",
  "2027-2028",
  "2028-2029",
  "2029-2030",
];

const STORAGE_KEY = "cfsg-academic-years";

function parseStartYear(year: string): number {
  const start = parseInt(year.slice(0, 4), 10);
  return Number.isNaN(start) ? 0 : start;
}

/** Given "2027-2028", returns "2028-2029". */
export function nextAcademicYear(year: string): string {
  const start = parseStartYear(year);
  if (!start) return "2030-2031";
  return `${start + 1}-${start + 2}`;
}

/** Load persisted academic years (fall back to defaults). */
export function loadAcademicYears(): string[] {
  if (typeof window === "undefined") return DEFAULT_ACADEMIC_YEARS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as string[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        return [...new Set(parsed)].sort();
      }
    }
  } catch {
    // ignore and fall back
  }
  return DEFAULT_ACADEMIC_YEARS;
}

/** Persist the current list (called whenever a new year is added). */
export function saveAcademicYears(years: string[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...new Set(years)].sort()));
  } catch {
    // ignore storage failures
  }
}

/** Add the next academic year after `from` and return the new list. */
export function addNextAcademicYear(years: string[], from: string): string[] {
  const next = nextAcademicYear(from);
  const updated = [...new Set([...years, next])].sort();
  saveAcademicYears(updated);
  return updated;
}