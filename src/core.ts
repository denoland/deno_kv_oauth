// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import { assert, type Cookie, SECOND, Status, type Tokens } from "../deps.ts";

export const OAUTH_COOKIE_NAME = "oauth-session";
export const SITE_COOKIE_NAME = "site-session";

// Determines whether the request URL is of a secure origin using the HTTPS protocol.
export function isSecure(requestUrl: string) {
  return new URL(requestUrl).protocol === "https:";
}

// Dynamically prefixes the cookie name, depending on whether it's for a secure origin (HTTPS).
export function getCookieName(name: string, isSecure: boolean) {
  return isSecure ? "__Host-" + name : name;
}

/** @see {@link https://web.dev/first-party-cookie-recipes/#the-good-first-party-cookie-recipe} */
export const COOKIE_BASE = {
  path: "/",
  httpOnly: true,
  // 90 days
  maxAge: 7776000,
  sameSite: "Lax",
} as Required<Pick<Cookie, "path" | "httpOnly" | "maxAge" | "sameSite">>;

const KV_PATH_KEY = "KV_PATH";
let path = undefined;
if (
  (await Deno.permissions.query({ name: "env", variable: KV_PATH_KEY }))
    .state === "granted"
) {
  path = Deno.env.get(KV_PATH_KEY);
}
const kv = await Deno.openKv(path);

// For graceful shutdown after tests.
addEventListener("beforeunload", async () => {
  await kv.close();
});

// Includes `expiresAt` and `id`
export type SessionKey = [number, string];

export function stringifySessionKeyCookie(key: SessionKey) {
  return encodeURIComponent(JSON.stringify(key));
}

export function parseJsonCookie(text: string) {
  return JSON.parse(decodeURIComponent(text));
}

export function assertIsSessionKey(
  // deno-lint-ignore no-explicit-any
  value: any,
  msg?: string,
): asserts value is SessionKey {
  assert(
    Array.isArray(value) && typeof value[0] === "number" &&
      typeof value[1] === "string" && value.length === 2,
    msg,
  );
}

// OAuth 2.0 session
export interface OAuthSession {
  state: string;
  codeVerifier: string;
}

const OAUTH_SESSION_PREFIX = "oauth_sessions";

// Retrieves the OAuth 2.0 session object for the given OAuth 2.0 session key.
export async function getOAuthSession(key: SessionKey) {
  const result = await kv.get<OAuthSession>([OAUTH_SESSION_PREFIX, ...key]);
  return result.value;
}

// Stores the OAuth 2.0 session object for the given OAuth 2.0 session key.
export async function setOAuthSession(key: SessionKey, value: OAuthSession) {
  await kv.set([OAUTH_SESSION_PREFIX, ...key], value);
}

// Deletes the OAuth 2.0 session object for the given OAuth 2.0 session key.
export async function deleteOAuthSession(key: SessionKey) {
  await kv.delete([OAUTH_SESSION_PREFIX, ...key]);
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

  const expiresIn = (Date.now() - storedTokens.expiresAt.getTime()) / SECOND;

  const tokens = { ...storedTokens };
  delete tokens.expiresAt;
  return { ...tokens, expiresIn };
}

/**
 * Retrieves the token for the given session key.
 * Before retrieval, the stored token is converted to a normal token using {@linkcode toTokens}.
 */
export async function getTokensBySession(
  key: SessionKey,
  consistency?: Deno.KvConsistencyLevel,
) {
  const result = await kv.get<StoredTokens>([
    STORED_TOKENS_BY_SESSION_PREFIX,
    ...key,
  ], { consistency });
  return result.value !== null ? toTokens(result.value) : null;
}

/**
 * Stores the token for the given session key.
 * Before storage, the token is converted to a stored token using {@linkcode toStoredTokens}.
 */
export async function setTokensBySession(
  key: SessionKey,
  tokens: Tokens,
) {
  const storedTokens = toStoredTokens(tokens);
  await kv.set([STORED_TOKENS_BY_SESSION_PREFIX, ...key], storedTokens);
}

// Deletes the token for the given session key.
export async function deleteStoredTokensBySession(key: SessionKey) {
  await kv.delete([STORED_TOKENS_BY_SESSION_PREFIX, ...key]);
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
