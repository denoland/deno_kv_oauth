// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import { type Cookie, SECOND, Status, type Tokens } from "../deps.ts";

export const OAUTH_COOKIE_NAME = "oauth-session";
export const SITE_COOKIE_NAME = "site-session";

// Determines whether the request URL is of a secure origin using the HTTPS protocol.
export function isSecure(requestUrl: string) {
  return requestUrl.startsWith("https");
}

// Dynamically prefixes the cookie name, depending on whether it's for a secure origin (HTTPS).
export function getCookieName(name: string, isSecure: boolean) {
  return isSecure ? "__Host-" + name : name;
}

/** @see {@link https://web.dev/first-party-cookie-recipes/#the-good-first-party-cookie-recipe} */
export const COOKIE_BASE = {
  path: "/",
  httpOnly: true,
  /** 90 days */
  maxAge: 7776000,
  sameSite: "Lax",
} as Partial<Cookie>;

const kv = await Deno.openKv(":memory:");

// For graceful shutdown after tests.
addEventListener("beforeunload", async () => {
  await kv.close();
});

// OAuth 2.0 session
export interface OAuthSession {
  state: string;
  codeVerifier: string;
}

const OAUTH_SESSION_PREFIX = "oauth_sessions";

// Retrieves the OAuth 2.0 session object for the given OAuth 2.0 session ID.
export async function getOAuthSession(oauthSessionId: string) {
  const result = await kv.get<OAuthSession>([
    OAUTH_SESSION_PREFIX,
    oauthSessionId,
  ]);
  return result.value;
}

// Stores the OAuth 2.0 session object for the given OAuth 2.0 session ID.
export async function setOAuthSession(
  oauthSessionId: string,
  oauthSession: OAuthSession,
) {
  await kv.set([OAUTH_SESSION_PREFIX, oauthSessionId], oauthSession);
}

// Deletes the OAuth 2.0 session object for the given OAuth 2.0 session ID.
export async function deleteOAuthSession(oauthSessionId: string) {
  await kv.delete([OAUTH_SESSION_PREFIX, oauthSessionId]);
}

// Tokens by session
const STORED_TOKENS_BY_SESSION_PREFIX = "stored_tokens_by_session";

// Token which has an expiry that's time-absolute, instead of time-relative.
interface StoredTokens extends Omit<Tokens, "expiresIn"> {
  expiresAt?: Date;
}

/**
 * Converts a normal token, with a time-relative expiry, to a stored token, with a time-absolute expiry.
 * This is done by replacing the normal token's `expiresIn` property with an `expiresAt` property.
 *
 * Note: this is exported for testing purposes only.
 */
export function toStoredTokens(tokens: Tokens): StoredTokens {
  if (tokens.expiresIn === undefined) return tokens;

  const expiresAt = new Date(Date.now() + (tokens.expiresIn * SECOND));

  const storedTokens = { ...tokens };
  delete storedTokens.expiresIn;
  return { ...storedTokens, expiresAt };
}

/**
 * Converts a stored token, with a time-absolute expiry, to a normal token, with a time-relative expiry.
 * This is done by replacing the stored token's `expiresAt` property with an `expiresIn` property.
 *
 * Note: this is exported for testing purposes only.
 */
export function toTokens(storedTokens: StoredTokens): Tokens {
  if (storedTokens.expiresAt === undefined) return storedTokens;

  const expiresIn =
    (Date.now() - Date.parse(storedTokens.expiresAt.toString())) / SECOND;

  const tokens = { ...storedTokens };
  delete tokens.expiresAt;
  return { ...tokens, expiresIn };
}

/**
 * Retrieves the token for the given session ID.
 * Before retrieval, the stored token is converted to a normal token using {@linkcode toTokens}.
 */
export async function getTokensBySession(sessionId: string) {
  const result = await kv.get<StoredTokens>([
    STORED_TOKENS_BY_SESSION_PREFIX,
    sessionId,
  ]);
  return result.value !== null ? toTokens(result.value) : null;
}

/**
 * Stores the token for the given session ID.
 * Before storage, the token is converted to a stored token using {@linkcode toStoredTokens}.
 */
export async function setTokensBySession(
  sessionId: string,
  tokens: Tokens,
) {
  const storedTokens = toStoredTokens(tokens);
  await kv.set([STORED_TOKENS_BY_SESSION_PREFIX, sessionId], storedTokens);
}

// Deletes the token for the given session ID.
export async function deleteStoredTokensBySession(sessionId: string) {
  await kv.delete([STORED_TOKENS_BY_SESSION_PREFIX, sessionId]);
}

/**
 * Returns a response that redirects the client to the specified location.
 * The location can be a relative path or absolute URL.
 * This function differs from [Response.redirect()]{@linkcode https://developer.mozilla.org/en-US/docs/Web/API/Response/redirect_static} in that it allows for relative URLs to be specified.
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Location}
 */
export function redirect(location: string) {
  return new Response(null, {
    headers: {
      location,
    },
    status: Status.Found,
  });
}

/** @todo Replace this function with a single-file export if https://github.com/denoland/deno_std/pull/3445 lands. */
export function assert(cond: unknown, message: string): asserts cond {
  if (!cond) {
    throw new Error(message);
  }
}
