// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import { type Cookie, SECOND, Status, type Tokens } from "../deps.ts";

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
const STORED_TOKENS_BY_SESSION_PREFIX = "stored_tokens_by_session";

interface StoredTokens extends Omit<Tokens, "expiresIn"> {
  expiresAt?: Date;
}

// Exported for testing purposes only
export function toStoredTokens(tokens: Tokens): StoredTokens {
  if (tokens.expiresIn === undefined) return tokens;

  const expiresAt = new Date(Date.now() + (tokens.expiresIn * SECOND));

  const storedTokens = { ...tokens };
  delete storedTokens.expiresIn;
  return { ...storedTokens, expiresAt };
}

// Exported for testing purposes only
export function toTokens(storedTokens: StoredTokens): Tokens {
  if (storedTokens.expiresAt === undefined) return storedTokens;

  const expiresIn =
    (Date.now() - Date.parse(storedTokens.expiresAt.toString())) / SECOND;

  const tokens = { ...storedTokens };
  delete tokens.expiresAt;
  return { ...tokens, expiresIn };
}

export async function getTokensBySiteSession(id: string) {
  const result = await kv.get<StoredTokens>([
    STORED_TOKENS_BY_SESSION_PREFIX,
    id,
  ]);
  return result.value !== null ? toTokens(result.value) : null;
}

export async function setTokensBySiteSession(
  id: string,
  tokens: StoredTokens,
) {
  const storedTokens = toStoredTokens(tokens);
  await kv.set([STORED_TOKENS_BY_SESSION_PREFIX, id], storedTokens);
}

export async function deleteStoredTokensBySiteSession(id: string) {
  await kv.delete([STORED_TOKENS_BY_SESSION_PREFIX, id]);
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

export function assert(cond: unknown, message: string) {
  if (!cond) {
    throw new Error(message);
  }
}
