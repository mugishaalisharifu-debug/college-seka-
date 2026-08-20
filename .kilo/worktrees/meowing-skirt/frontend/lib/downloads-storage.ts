import { DOWNLOADS_DATA, type DownloadItem } from "@/exports";

const STORAGE_KEY = "cfsg-downloads-data";
const CHANGE_EVENT = "cfsg-downloads-changed";

let cachedRaw: string | null = null;
let cachedValue: DownloadItem[] = DOWNLOADS_DATA;

export function getStoredDownloads(): DownloadItem[] {
  if (typeof window === "undefined") {
    return DOWNLOADS_DATA;
  }

  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return DOWNLOADS_DATA;
  }

  if (raw === cachedRaw) return cachedValue;

  cachedRaw = raw;
  cachedValue = DOWNLOADS_DATA;

  if (raw) {
    try {
      const parsed = JSON.parse(raw) as DownloadItem[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        cachedValue = parsed;
      }
    } catch {
      cachedValue = DOWNLOADS_DATA;
    }
  }

  return cachedValue;
}

export function getServerDownloads(): DownloadItem[] {
  return DOWNLOADS_DATA;
}

export function subscribeToStoredDownloads(onChange: () => void): () => void {
  window.addEventListener("storage", onChange);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

export function saveStoredDownloads(items: DownloadItem[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(CHANGE_EVENT));
}
