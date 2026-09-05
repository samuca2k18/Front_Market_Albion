/**
 * Validate a post-login return path to prevent open redirects.
 * Only same-origin relative paths starting with a single `/` are allowed.
 */
export function getSafeReturnTo(value: string | null | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed.startsWith('/') || trimmed.startsWith('//')) return null;
  if (trimmed.includes('://')) return null;
  return trimmed;
}
