// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import { type Cookie, SECOND, Status, type Tokens } from "../deps.ts";
import type { OAuthSession } from "./types.ts";
export type { OAuthSession } from "./types.ts";

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

const OAUTH_SESSIONS_PREFIX = "oauth_sessions";

// Retrieves the OAuth 2.0 session object for the given OAuth 2.0 session ID.
export async function getOAuthSession(id: string) {
  const result = await kv.get<OAuthSession>([OAUTH_SESSIONS_PREFIX, id]);
  return result.value;
}

// Lists all OAuth 2.0 session entries.
export function listOAuthSessions() {
  return kv.list<OAuthSession>({ prefix: [OAUTH_SESSIONS_PREFIX] });
}

// Stores the OAuth 2.0 session object for the given OAuth 2.0 session ID.
export async function setOAuthSession(id: string, value: OAuthSession) {
  await kv.set([OAUTH_SESSIONS_PREFIX, id], value);
}

// Deletes the OAuth 2.0 session object for the given OAuth 2.0 session ID.
export async function deleteOAuthSession(id: string) {
  await kv.delete([OAUTH_SESSIONS_PREFIX, id]);
}

/**
 * Legacy stored tokens
 *
 * @deprecated To be removed from v1.0.0
 */
const LEGACY_TOKENS_PREFIX = "stored_tokens_by_session";

/**
 * Exported for testing purposes only.
 *
 * @deprecated To be removed from v1.0.0
 */
export async function getLegacyTokens(sessionId: string) {
  // deno-lint-ignore no-explicit-any
  const res = await kv.get<any>([LEGACY_TOKENS_PREFIX, sessionId]);
  return res.value;
}

/**
 * Lists all legacy tokens entries.
 *
 * @deprecated To be removed from v1.0.0
 */
export function listLegacyTokens() {
  // deno-lint-ignore no-explicit-any
  return kv.list<any>({ prefix: [LEGACY_TOKENS_PREFIX] });
}

/**
 * Exported for testing purposes only.
 *
 * @deprecated To be removed from v1.0.0
 */
// deno-lint-ignore no-explicit-any
export async function setLegacyTokens(sessionId: string, tokens: any) {
  await kv.set([LEGACY_TOKENS_PREFIX, sessionId], tokens);
}

/** @deprecated To be removed from v1.0.0 */
export async function deleteLegacyTokens(sessionId: string) {
  await kv.delete([LEGACY_TOKENS_PREFIX, sessionId]);
}

// Tokens

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

const TOKENS_PREFIX = "tokens";

// Retrieves the token for the given session ID.
export async function getTokens(
  sessionId: string,
  consistency?: Deno.KvConsistencyLevel,
) {
  const result = await kv.get<Tokens>([TOKENS_PREFIX, sessionId], {
    consistency,
  });
  return result.value !== null ? toTokens(result.value) : null;
}

// Lists all tokens entries.
export function listTokens() {
  return kv.list<Tokens>({ prefix: [TOKENS_PREFIX] });
}

/**
 * Stores the token for the given session ID.
 * Before storage, the token is converted to a stored token using {@linkcode toStoredTokens}.
 */
export async function setTokens(sessionId: string, tokens: Tokens) {
  const storedTokens = toStoredTokens(tokens);
  await kv.set([TOKENS_PREFIX, sessionId], storedTokens);
}

// Deletes the token for the given session ID.
export async function deleteTokens(sessionId: string) {
  await kv.delete([TOKENS_PREFIX, sessionId]);
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

// See "Redirect URL after Sign-In or Sign-Out" section in the README for more information on the success URL.
export function getSuccessUrl(request: Request) {
  const url = new URL(request.url);

  const successUrl = url.searchParams.get("success_url");
  if (successUrl !== null) return successUrl;

  const referrer = request.headers.get("referer");
  if (referrer !== null && (new URL(referrer).origin === url.origin)) {
    return referrer;
  }

  return "/";
}
