// ============================================================
// BROWSER UTILITIES — Second Brain
// Cross-platform external link opener (macOS, Windows, Linux)
// Uses @tauri-apps/plugin-opener with browser fallback
// ============================================================

import { openUrl } from "@tauri-apps/plugin-opener";

/**
 * Open external URL in user's default web browser across macOS, Windows, and Linux.
 */
export async function openExternalUrl(url: string, e?: React.MouseEvent) {
  if (e) {
    e.preventDefault();
  }
  if (!url || typeof url !== "string") return;

  try {
    await openUrl(url);
  } catch (err) {
    // Fallback for standard browser / dev environment
    window.open(url, "_blank", "noopener,noreferrer");
  }
}
