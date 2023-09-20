// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import { getCookies } from "../deps.ts";
import { getCookieName, isSecure, SITE_COOKIE_NAME } from "./_core.ts";

/**
 * Gets the session ID for a given request. This is well-suited for checking
 * whether the client is signed in by checking if undefined.
 *
 * It does this by getting the session ID from the cookie in the given request.
 * If the request has no cookie, undefined is returned.
 *
 * @param request The HTTP request from the client.
 *
 * @example
 * ```ts
 * import { getSessionId } from "https://deno.land/x/deno_kv_oauth@$VERSION/mod.ts";
 *
 * export function handler(request: Request) {
 *   const sessionId = getSessionId(request);
 *   const hasSessionIdCookie = sessionId !== undefined;
 *
 *   return Response.json({ sessionId, hasSessionIdCookie });
 * }
 * ```
 */
export function getSessionId(request: Request) {
  const cookieName = getCookieName(SITE_COOKIE_NAME, isSecure(request.url));
  return getCookies(request.headers)[cookieName] as string | undefined;
}
