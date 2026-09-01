// ============================================================
// VALIDATION UTILITIES — Second Brain
// Input validation for forms
// ============================================================

/** Check if a string looks like a valid URL */
export function isValidUrl(str: string): boolean {
  if (!str.trim()) return false;
  try {
    const url = new URL(str);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

/** Check if a string is non-empty after trimming */
export function isNonEmpty(str: string): boolean {
  return str.trim().length > 0;
}

/** Validate problem form — returns array of error messages */
export function validateProblemForm(data: {
  title: string;
  url: string;
  platform_id: number;
}): string[] {
  const errors: string[] = [];

  if (!isNonEmpty(data.title)) {
    errors.push("Problem name is required.");
  }

  if (!isNonEmpty(data.url)) {
    errors.push("Problem URL is required.");
  } else if (!isValidUrl(data.url)) {
    errors.push("Please enter a valid URL (starting with http:// or https://).");
  }

  if (!data.platform_id || data.platform_id === 0) {
    errors.push("Please select a platform.");
  }

  return errors;
}
