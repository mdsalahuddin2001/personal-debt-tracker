// Shared link constants and pure helpers. Kept free of server-only imports so
// both the Mongoose model layer and client components can use them.

// Hard caps mirrored by the Zod schema and the action — kept here so the form,
// the action, and the schema all agree on the same limits.
export const MAX_LINK_TAGS = 12;
export const MAX_LINK_TAG_LENGTH = 30;

/** Prepend https:// when the user omits a protocol (e.g. "example.com"). */
export function normalizeUrl(raw: string): string {
  const trimmed = raw.trim();
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

/** Whether a raw URL string (with or without protocol) parses as a valid URL. */
export function isValidUrl(raw: string): boolean {
  try {
    new URL(normalizeUrl(raw));
    return true;
  } catch {
    return false;
  }
}

/** A favicon URL for the link's host, or "" when the URL can't be parsed. */
export function faviconUrl(url: string): string {
  try {
    const { hostname } = new URL(normalizeUrl(url));
    return `https://icons.duckduckgo.com/ip3/${hostname}.ico`;
  } catch {
    return "";
  }
}

/** The bare host (no "www.") for display under the title, or "" if unparsable. */
export function displayHost(url: string): string {
  try {
    return new URL(normalizeUrl(url)).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}
