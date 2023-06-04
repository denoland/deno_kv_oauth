// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import { type Cookie, Status, type Tokens } from "../deps.ts";

export const OAUTH_COOKIE_NAME = "oauth-session";
export const SITE_COOKIE_NAME = "site-session";

export function isSecure(requestUrl: string) {
  return requestUrl.startsWith("https");
}

export function getCookieName(name: string, isSecure: boolean) {
  return isSecure ? "__Host-" + name : name;
}

/**
 * @see {@link https://web.dev/first-party-cookie-recipes/#the-good-first-party-cookie-recipe}
 */
export const COOKIE_BASE = {
  path: "/",
  httpOnly: true,
  maxAge: 7776000,
  sameSite: "Lax",
} as Partial<Cookie>;

const kv = await Deno.openKv();

// OAuth session
export interface OAuthSession {
  state: string;
  codeVerifier: string;
}

const OAUTH_SESSION_PREFIX = "oauth_sessions";

export async function getOAuthSession(id: string) {
  const result = await kv.get<OAuthSession>([OAUTH_SESSION_PREFIX, id]);
  return result.value;
}

export async function setOAuthSession(id: string, oauthSession: OAuthSession) {
  await kv.set([OAUTH_SESSION_PREFIX, id], oauthSession);
}

export async function deleteOAuthSession(id: string) {
  await kv.delete([OAUTH_SESSION_PREFIX, id]);
}

// Tokens by session
const TOKENS_BY_SESSION_PREFIX = "tokens_by_session";

export async function getTokensBySiteSession(id: string) {
  const result = await kv.get<Tokens>([TOKENS_BY_SESSION_PREFIX, id]);
  return result.value;
}

export async function setTokensBySiteSession(id: string, tokens: Tokens) {
  await kv.set([TOKENS_BY_SESSION_PREFIX, id], tokens);
}

export async function deleteTokensBySiteSession(id: string) {
  await kv.delete([TOKENS_BY_SESSION_PREFIX, id]);
}

/**
 * @param location A relative (to the request URL) or absolute URL.
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
