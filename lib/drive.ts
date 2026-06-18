// =========================================================
// Google Drive media helper — the ONLY place that knows the URL format.
// DB stores Drive file IDs; this builds the display URL.
// If Google throttles/changes the format, fix it here only. Swappable to
// Supabase Storage / a real CDN later without touching the rest of the app.
// =========================================================

// Width requested from Drive's thumbnail endpoint (it serves up to ~w1600).
const DRIVE_IMG_WIDTH = 1600;

export function driveImageUrl(fileId: string): string {
  // NOTE: the old `uc?export=view&id=` endpoint works when opened directly in a
  // browser tab but NOT as an <img src> — Drive returns a redirect / confirm
  // page instead of the image bytes when hotlinked. The `thumbnail` endpoint
  // serves the raw image and is reliable for embedding ("Anyone with the link"
  // sharing required). For full-res instead, use:
  //   `https://lh3.googleusercontent.com/d/${fileId}`
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w${DRIVE_IMG_WIDTH}`;
}

/** Convenience for nullable DB fields — returns null when no file ID. */
export function driveImageUrlOrNull(
  fileId: string | null | undefined,
): string | null {
  return fileId ? driveImageUrl(fileId) : null;
}

/**
 * Resolve a stored media value to a usable URL. Passes through absolute URLs
 * (http/https) and root-relative paths (local /public assets, e.g.
 * "/img/foo.png") unchanged; otherwise treats the value as a Google Drive
 * file ID.
 */
export function resolveMediaUrl(
  value: string | null | undefined,
): string | null {
  if (!value) return null;
  return /^(https?:\/\/|\/)/i.test(value) ? value : driveImageUrl(value);
}
