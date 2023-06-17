// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import { getCookies } from "../deps.ts";
import {
  getCookieName,
  getTokensBySession,
  isSecure,
  SITE_COOKIE_NAME,
} from "./_core.ts";

/**
 * Gets the session ID for a given request. This is well-suited for checking whether the client is signed in by checking if nullish.
 *
 * It does this by:
 * 1. Getting the session ID from the cookie in the given request. If the request has no cookie, null is returned.
 * 2. Getting the OAuth 2.0 session object using the session ID from KV. If the OAuth 2.0 token doesn't exist, null is returned.
 *
 * @param request The HTTP request from the client.
 *
 * @example
 * ```ts
 * import { getSessionId } from "https://deno.land/x/deno_kv_oauth@$VERSION/mod.ts";
 *
 * export async function handler(request: Request) {
 *   const sessionId = await getSessionId(request);
 *   const isSignedIn = sessionId !== null;
 *
 *   return Response.json({ sessionId, isSignedIn });
 * }
 * ```
 */
export async function getSessionId(request: Request) {
  const cookieName = getCookieName(SITE_COOKIE_NAME, isSecure(request.url));
  const sessionId = getCookies(request.headers)[cookieName];
  if (sessionId === undefined) return null;

  // First, try with eventual consistency. If that returns null, try with strong consistency.
  if (
    await getTokensBySession(sessionId, "eventual") ||
    await getTokensBySession(sessionId)
  ) {
    return sessionId;
  }

  return null;
}
