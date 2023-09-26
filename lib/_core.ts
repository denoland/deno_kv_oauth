// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import { type Cookie, Status } from "../deps.ts";

export const OAUTH_COOKIE_NAME = "oauth-session";
export const SITE_COOKIE_NAME = "site-session";

/**
 * Determines whether the request URL is of a secure origin using the HTTPS
 * protocol.
 */
export function isSecure(requestUrl: string) {
  return new URL(requestUrl).protocol === "https:";
}

/**
 * Dynamically prefixes the cookie name, depending on whether it's for a secure
 * origin (HTTPS).
 */
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

const DENO_KV_PATH_KEY = "DENO_KV_PATH";
let path = undefined;
if (
  (await Deno.permissions.query({ name: "env", variable: DENO_KV_PATH_KEY }))
    .state === "granted"
) {
  path = Deno.env.get(DENO_KV_PATH_KEY);
}
const kv = await Deno.openKv(path);

// For graceful shutdown after tests.
addEventListener("beforeunload", async () => {
  await kv.close();
});

// OAuth session
export interface OAuthSession {
  state: string;
  codeVerifier: string;
  successUrl?: string;
}

const OAUTH_SESSIONS_PREFIX = "oauth_sessions";

// Retrieves the OAuth session object for the given OAuth session ID.
export async function getOAuthSession(id: string) {
  const result = await kv.get<OAuthSession>([OAUTH_SESSIONS_PREFIX, id]);
  return result.value;
}

// Lists all OAuth session entries.
export function listOAuthSessions() {
  return kv.list<OAuthSession>({ prefix: [OAUTH_SESSIONS_PREFIX] });
}

// Stores the OAuth session object for the given OAuth session ID.
export async function setOAuthSession(
  id: string,
  value: OAuthSession,
  options?: { expireIn?: number },
) {
  await kv.set([OAUTH_SESSIONS_PREFIX, id], value, options);
}

// Deletes the OAuth session object for the given OAuth session ID.
export async function deleteOAuthSession(id: string) {
  await kv.delete([OAUTH_SESSIONS_PREFIX, id]);
}

/**
 * Legacy stored tokens
 *
 * @deprecated To be removed once OAuth session expiration is implemented.
 */
const LEGACY_TOKENS_1_PREFIX = "stored_tokens_by_session";

/**
 * Legacy stored tokens
 *
 * @deprecated To be removed once OAuth session expiration is implemented.
 */
const LEGACY_TOKENS_2_PREFIX = "tokens";

/**
 * Lists all legacy tokens entries.
 *
 * @deprecated To be removed once OAuth session expiration is implemented.
 */
export function listLegacyTokens1() {
  return kv.list({ prefix: [LEGACY_TOKENS_1_PREFIX] });
}

/**
 * Lists all legacy tokens entries.
 *
 * @deprecated To be removed once OAuth session expiration is implemented.
 */
export function listLegacyTokens2() {
  return kv.list({ prefix: [LEGACY_TOKENS_2_PREFIX] });
}

/**
 * Exported for testing purposes only.
 *
 * @deprecated To be removed once OAuth session expiration is implemented.
 */
export async function setLegacyTokens1(sessionId: string, tokens: unknown) {
  await kv.set([LEGACY_TOKENS_1_PREFIX, sessionId], tokens);
}

/**
 * Exported for testing purposes only.
 *
 * @deprecated To be removed once OAuth session expiration is implemented.
 */
export async function setLegacyTokens2(sessionId: string, tokens: unknown) {
  await kv.set([LEGACY_TOKENS_2_PREFIX, sessionId], tokens);
}

/**
 * Exported for testing purposes only.
 *
 * @deprecated To be removed once OAuth session expiration is implemented.
 */
export async function getLegacyTokens1(sessionId: string) {
  const res = await kv.get([LEGACY_TOKENS_1_PREFIX, sessionId]);
  return res.value;
}

/**
 * Exported for testing purposes only.
 *
 * @deprecated To be removed once OAuth session expiration is implemented.
 */
export async function getLegacyTokens2(sessionId: string) {
  const res = await kv.get([LEGACY_TOKENS_2_PREFIX, sessionId]);
  return res.value;
}

/**
 * Delete legacy token entry
 *
 * @deprecated To be removed once OAuth session expiration is implemented.
 */
export async function deleteLegacyTokens1(sessionId: string) {
  await kv.delete([LEGACY_TOKENS_1_PREFIX, sessionId]);
}

/**
 * Delete legacy token entry
 *
 * @deprecated To be removed once OAuth session expiration is implemented.
 */
export async function deleteLegacyTokens2(sessionId: string) {
  await kv.delete([LEGACY_TOKENS_2_PREFIX, sessionId]);
}

/**
 * Returns a response that redirects the client to the specified location.
 * The location can be a relative path or absolute URL.
 * This function differs from
 * [Response.redirect()]{@linkcode https://developer.mozilla.org/en-US/docs/Web/API/Response/redirect_static}
 * in that it allows for relative URLs to be specified.
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

/**
 * See "Redirect URL after Sign-In or Sign-Out" section in the README for more
 * information on the success URL.
 */
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
