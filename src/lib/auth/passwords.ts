/**
 * Native Web Crypto API password hashing and verification using PBKDF2-HMAC-SHA256.
 * Zero external dependencies (no bcrypt, native on Edge, Node.js, and browser).
 */

const ITERATIONS = 100_000;
const KEY_LENGTH = 32; // 256 bits

function bufferToHex(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let hex = "";
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, "0");
  }
  return hex;
}

function hexToBuffer(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

/**
 * Hash a plain-text password with a cryptographically secure random salt.
 * Returns format: "pbkdf2:100000:<salt-hex>:<hash-hex>"
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const encoder = new TextEncoder();

  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits"]
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: salt as unknown as BufferSource,
      iterations: ITERATIONS,
      hash: "SHA-256",
    },
    keyMaterial,
    KEY_LENGTH * 8
  );

  const saltHex = bufferToHex(salt.buffer as ArrayBuffer);
  const hashHex = bufferToHex(derivedBits);

  return `pbkdf2:${ITERATIONS}:${saltHex}:${hashHex}`;
}

/**
 * Verify a plain-text password against a stored PBKDF2 hash string.
 * Performs constant-time comparison to prevent timing side-channel attacks.
 */
export async function verifyPassword(
  password: string,
  storedHash: string
): Promise<boolean> {
  try {
    const parts = storedHash.split(":");
    if (parts.length !== 4 || parts[0] !== "pbkdf2") {
      return false;
    }

    const iterations = parseInt(parts[1], 10);
    const salt = hexToBuffer(parts[2]);
    const originalHash = parts[3];

    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      encoder.encode(password),
      { name: "PBKDF2" },
      false,
      ["deriveBits"]
    );

    const derivedBits = await crypto.subtle.deriveBits(
      {
        name: "PBKDF2",
        salt: salt as unknown as BufferSource,
        iterations,
        hash: "SHA-256",
      },
      keyMaterial,
      KEY_LENGTH * 8
    );

    const calculatedHash = bufferToHex(derivedBits);

    // Constant-time comparison to prevent timing attacks
    if (calculatedHash.length !== originalHash.length) {
      return false;
    }

    let diff = 0;
    for (let i = 0; i < calculatedHash.length; i++) {
      diff |= calculatedHash.charCodeAt(i) ^ originalHash.charCodeAt(i);
    }

    return diff === 0;
  } catch (error) {
    console.error("Password verification error:", error);
    return false;
  }
}
