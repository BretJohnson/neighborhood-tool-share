export const DEFAULT_PHONE_MASK = "+1 (xxx) xxx-xxxx";

/**
 * Format a US phone number into +1 (XXX) XXX-XXXX style.
 * Falls back to the original input if formatting is not possible.
 */
export function formatPhoneNumber(raw: string | null | undefined): string {
  if (!raw) return "";

  const digits = raw.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("1")) {
    return formatWithMask(digits.slice(1));
  }

  if (digits.length === 10) {
    return formatWithMask(digits);
  }

  return raw.trim();
}

/**
 * Normalizes a string for use in case-insensitive comparisons.
 */
export function normalizeSearchTerm(term: string): string {
  return term.trim().toLowerCase();
}

/**
 * Small helper to join class names without pulling in an external dependency.
 */
export function cx(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

function formatWithMask(digits: string): string {
  return `+1 (${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}
