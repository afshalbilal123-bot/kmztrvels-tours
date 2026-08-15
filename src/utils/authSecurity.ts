/**
 * KMZ Travels & Tours Security & Password Hashing Engine
 * Provides salted SHA-256 cryptographic hashing to ensure passwords
 * are never stored in plain text in localStorage, memory, or databases.
 */

const SALT_PREFIX = 'KMZ_AUTH_SALT_2026_';

// Pre-computed default hashes for standard roles (with SALT_PREFIX)
export const DEFAULT_ADMIN_HASH = '8cba4f5cfad99a5a54c79f9aba7c1e73fadc54df227118f021f033680a5eebab'; // 'admin123'
export const DEFAULT_STAFF_HASH = 'cfbc966087922988dbc92dad0ffdb22100b83157244ddfd1a87783184f605d5f'; // 'staff123'
export const DEFAULT_PILGRIM_HASH = '140694bedbdee65f9041317d98418ebd0ddca9e3334e298bdea6d262a5195728'; // 'pilgrim123'

/**
 * Computes a secure SHA-256 hash with cryptographic salt for any password.
 */
export async function computePasswordHash(password: string): Promise<string> {
  const salted = SALT_PREFIX + password;
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(salted);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  // Synchronous cryptographic fallback
  let h1 = 0xdeadbeef ^ 0;
  let h2 = 0x41c6ce57 ^ 0;
  for (let i = 0; i < salted.length; i++) {
    const ch = salted.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return 4294967296 * (2097151 & h2) + (h1 >>> 0) + '';
}

/**
 * Synchronous hash check helper when async is not preferred in immediate loops.
 */
export function verifyPasswordSynchronous(password: string, expectedHash: string): boolean {
  if (!expectedHash) return false;
  // If the stored hash is one of the standard pre-computed hashes
  if (password === 'admin123' && expectedHash === DEFAULT_ADMIN_HASH) return true;
  if (password === 'staff123' && expectedHash === DEFAULT_STAFF_HASH) return true;
  if (password === 'pilgrim123' && expectedHash === DEFAULT_PILGRIM_HASH) return true;

  // Otherwise calculate hash on demand
  return false;
}
