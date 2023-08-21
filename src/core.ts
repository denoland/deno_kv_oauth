// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import { type Cookie, SECOND, Status, type Tokens } from "../deps.ts";

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

// OAuth 2.0 session
export interface OAuthSession {
  state: string;
  codeVerifier: string;
}

const OAUTH_SESSION_PREFIX = "oauth_sessions";

// Retrieves the OAuth 2.0 session object for the given OAuth 2.0 session ID.
export async function getOAuthSession(id: string) {
  const result = await kv.get<OAuthSession>([OAUTH_SESSION_PREFIX, id]);
  return result.value;
}

// Lists all OAuth 2.0 session entries.
export function listOAuthSessions() {
  return kv.list<OAuthSession>({ prefix: [OAUTH_SESSION_PREFIX] });
}

// Stores the OAuth 2.0 session object for the given OAuth 2.0 session ID.
export async function setOAuthSession(
  id: string,
  value: OAuthSession,
  expireIn?: number,
) {
  await kv.set([OAUTH_SESSION_PREFIX, id], value, { expireIn });
}

// Deletes the OAuth 2.0 session object for the given OAuth 2.0 session ID.
export async function deleteOAuthSession(id: string) {
  await kv.delete([OAUTH_SESSION_PREFIX, id]);
}

// Legacy stored tokens
/** @deprecated To be removed from v1.0.0 */
const LEGACY_TOKENS_PREFIX = "stored_tokens_by_session";

// Lists all legacy tokens entries.
/** @deprecated To be removed from v1.0.0 */
export function listLegacyTokens() {
  return kv.list({ prefix: [LEGACY_TOKENS_PREFIX] });
}

/** @deprecated To be removed from v1.0.0 */
export async function deleteLegacyTokens(sessionId: string) {
  await kv.delete([LEGACY_TOKENS_PREFIX, sessionId]);
}

// Tokens
const TOKENS_PREFIX = "tokens";

// Retrieves the token for the given session ID.
export async function getTokens(
  sessionId: string,
  consistency?: Deno.KvConsistencyLevel,
) {
  const result = await kv.get<Tokens>([TOKENS_PREFIX, sessionId], {
    consistency,
  });
  return result.value;
}

// Lists all tokens entries.
export function listTokens() {
  return kv.list<Tokens>({ prefix: [TOKENS_PREFIX] });
}

// Stores the token for the given session ID.
export async function setTokens(sessionId: string, tokens: Tokens) {
  await kv.set([TOKENS_PREFIX, sessionId], tokens, {
    expireIn: tokens.expiresIn !== undefined
      ? tokens.expiresIn * SECOND
      : undefined,
  });
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
