export interface ClientAdminAuth {
  enabled: boolean;
  username: string;
  salt: string;
  passwordHash: string;
  updatedAt: string;
}

/**
 * Generates a cryptographically random hex salt using Web Crypto API
 */
export function generateCryptoSalt(byteLength = 16): string {
  const array = new Uint8Array(byteLength);
  window.crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Computes a salted multi-round SHA-256 hash using Web Crypto API.
 * The plaintext password is never stored in Firestore or in the site's HTML.
 */
export async function hashClientPassword(password: string, salt: string): Promise<string> {
  const encoder = new TextEncoder();
  let current = `${salt}::ghost_client_admin_v1::${password}`;

  // 3 rounds of SHA-256 to harden against rainbow tables
  for (let i = 0; i < 3; i++) {
    const data = encoder.encode(current);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    current = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  return current;
}

/**
 * Creates a ClientAdminAuth object ready to be saved in Firestore.
 */
export async function createAdminCredentials(
  username: string,
  plainPassword: string,
  enabled = true
): Promise<ClientAdminAuth> {
  const cleanUser = username.trim().toLowerCase();
  const salt = generateCryptoSalt(16);
  const passwordHash = await hashClientPassword(plainPassword, salt);

  return {
    enabled,
    username: cleanUser,
    salt,
    passwordHash,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Verifies a login attempt against the stored salted SHA-256 hash.
 */
export async function verifyAdminCredentials(
  inputUsername: string,
  inputPassword: string,
  storedAuth?: ClientAdminAuth | null
): Promise<boolean> {
  if (!storedAuth || !storedAuth.enabled || !storedAuth.passwordHash || !storedAuth.salt) {
    return false;
  }

  const cleanInputUser = inputUsername.trim().toLowerCase();
  const cleanStoredUser = (storedAuth.username || '').trim().toLowerCase();

  if (cleanInputUser !== cleanStoredUser) {
    return false;
  }

  const computedHash = await hashClientPassword(inputPassword, storedAuth.salt);

  // Constant-time comparison to prevent timing attacks
  if (computedHash.length !== storedAuth.passwordHash.length) {
    return false;
  }
  let diff = 0;
  for (let i = 0; i < computedHash.length; i++) {
    diff |= computedHash.charCodeAt(i) ^ storedAuth.passwordHash.charCodeAt(i);
  }
  return diff === 0;
}
