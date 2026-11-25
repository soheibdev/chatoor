/**
 * Validates that a URL uses a safe absolute HTTP or HTTPS protocol.
 * Rejects javascript:, data:, vbscript:, protocol-relative (//), and malformed strings.
 */
export function isSafeUrl(url?: string | null): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  return /^https?:\/\//i.test(trimmed);
}
