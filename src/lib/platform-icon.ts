/**
 * Detect a platform icon key from a URL host.
 * Returns a platform key or "link" (generic fallback).
 */
export function detectPlatformIcon(url: string): string {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    if (host.includes("instagram.com")) return "instagram";
    if (host.includes("x.com") || host.includes("twitter.com")) return "x";
    if (host.includes("youtube.com") || host.includes("youtu.be")) return "youtube";
    if (host.includes("github.com")) return "github";
    if (host.includes("tiktok.com")) return "tiktok";
    if (host.includes("linkedin.com")) return "linkedin";
    if (host.includes("facebook.com") || host.includes("fb.com")) return "facebook";
    if (host.includes("spotify.com")) return "spotify";
    if (host.includes("twitch.tv")) return "twitch";
  } catch {
    // invalid URL
  }
  return "link";
}
