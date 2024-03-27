import { encode } from "https://deno.land/std@0.161.0/encoding/base64.ts";

export interface PkceChallenge {
  codeVerifier: string;
  codeChallenge: string;
  codeChallengeMethod: string;
}

/**
 * Encodes the data as a URL-safe variant of Base64
 * in accordance with https://www.rfc-editor.org/rfc/rfc7636#appendix-A
 */
function encodeUrlSafe(data: string | ArrayBuffer): string {
  return encode(data)
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

/** Calculates the SHA256 hash of the given string */
async function sha256(str: string): Promise<ArrayBuffer> {
  const bytes = new TextEncoder().encode(str);
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return hash;
}

/** Returns a byte array of the given length, filled with random numbers */
function getRandomBytes(length: number): ArrayBuffer {
  const randomBytes = new Uint8Array(length);
  crypto.getRandomValues(randomBytes);
  return randomBytes;
}

/**
 * Creates a codeChallenge and codeVerifier in accordance with the
 * Proof Key for Code Exchange (PKCE) {@link https://www.rfc-editor.org/rfc/rfc7636 RFC7636}
 *
 * See {@link https://www.rfc-editor.org/rfc/rfc7636#section-4 RFC7636 Section 4}
 * for a step-by-step explanation of what's happening here.
 */
export async function createPkceChallenge(): Promise<PkceChallenge> {
  const randomBytes = _internals.getRandomBytes(32);
  const codeVerifier = encodeUrlSafe(randomBytes);

  const hash = await sha256(codeVerifier);
  const codeChallenge = encodeUrlSafe(hash);

  return {
    codeVerifier,
    codeChallenge,
    codeChallengeMethod: "S256",
  };
}

/** @deprecated This should only ever be used for testing */
export const _internals = { getRandomBytes };
