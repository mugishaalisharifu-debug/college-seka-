import axios from "axios";

/** Extract a human-friendly message from an axios/unknown error. */
export function getApiErrorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again.",
): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: unknown } | undefined;
    if (typeof data?.message === "string") return data.message;
    if (Array.isArray(data?.message) && data.message.length > 0) {
      return String(data.message[0]);
    }
    if (error.message) return error.message;
  }
  return fallback;
}

/** Format an ISO date string / Date into a short friendly date. */
export function formatDate(
  value: string | Date | null | undefined,
): string {
  if (!value) return "";
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}