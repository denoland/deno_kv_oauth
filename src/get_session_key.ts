// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import { getCookies } from "../deps.ts";
import {
  assertIsSessionKey,
  getCookieName,
  isSecure,
  parseJsonCookie,
  SITE_COOKIE_NAME,
} from "./core.ts";

/**
 * Gets the session key for a given request. This is well-suited for checking whether the client is signed in by checking if undefined.
 *
 * It does this by getting the session key from the cookie in the given request. If the request has no cookie, undefined is returned.
 *
 * @param request The HTTP request from the client.
 *
 * @example
 * ```ts
 * import { getSessionKey } from "https://deno.land/x/deno_kv_oauth@$VERSION/mod.ts";
 *
 * export function handler(request: Request) {
 *   const sessionKey = getSessionKey(request);
 *   const hasSessionKeyCookie = sessionKey !== undefined;
 *
 *   return Response.json({ sessionKey, hasSessionKeyCookie });
 * }
 * ```
 */
export function getSessionKey(request: Request) {
  const cookieName = getCookieName(SITE_COOKIE_NAME, isSecure(request.url));
  const sessionKeyRaw = getCookies(request.headers)[cookieName];
  if (sessionKeyRaw === undefined) return undefined;

  const sessionKey = parseJsonCookie(sessionKeyRaw);
  try {
    assertIsSessionKey(sessionKey);
    return sessionKey;
  } catch {
    return undefined;
  }
}
