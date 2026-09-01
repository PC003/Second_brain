// ============================================================
// DATE UTILITIES — Second Brain
// Date formatting and comparison helpers
// ============================================================

/** Format ISO date to human-readable string */
export function formatDate(isoDate: string | null | undefined): string {
  if (!isoDate) return "—";
  try {
    const date = new Date(isoDate);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return isoDate;
  }
}

/** Format ISO date to relative time (e.g., "2 days ago") */
export function formatRelativeDate(isoDate: string | null | undefined): string {
  if (!isoDate) return "—";
  try {
    const date = new Date(isoDate);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  } catch {
    return isoDate;
  }
}

/** Check if a date is today or before */
export function isDueOrOverdue(isoDate: string | null | undefined): boolean {
  if (!isoDate) return false;
  const date = new Date(isoDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date <= today;
}

/** Check if a date is today */
export function isToday(isoDate: string | null | undefined): boolean {
  if (!isoDate) return false;
  const date = new Date(isoDate).toISOString().split("T")[0];
  const today = new Date().toISOString().split("T")[0];
  return date === today;
}

/** Get today's date as YYYY-MM-DD */
export function getTodayString(): string {
  return new Date().toISOString().split("T")[0];
}

/** Add days to today and return as YYYY-MM-DD */
export function addDays(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split("T")[0];
}

/** Format ISO date to a short date, e.g. "Sep 1" */
export function formatDateShort(isoDate: string | null | undefined): string {
  if (!isoDate) return "—";
  try {
    const date = new Date(isoDate);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch {
    return "—";
  }
}

/** Calculate days until a date. Negative means past. */
export function daysUntil(isoDate: string | null | undefined): number | null {
  if (!isoDate) return null;
  const date = new Date(isoDate);
  if (isNaN(date.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  return Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

/** Format a review date with context (overdue, today, upcoming). */
export function formatReviewDate(isoDate: string | null | undefined): string {
  if (!isoDate) return "Not scheduled";
  const days = daysUntil(isoDate);
  if (days === null) return "Not scheduled";
  if (days < 0) return `Overdue by ${Math.abs(days)} day${Math.abs(days) !== 1 ? "s" : ""}`;
  if (days === 0) return "Due today";
  if (days === 1) return "Due tomorrow";
  if (days <= 7) return `Due in ${days} days`;
  return `Due ${formatDate(isoDate)}`;
}
