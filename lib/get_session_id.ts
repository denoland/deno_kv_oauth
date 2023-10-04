// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import { getCookies } from "../deps.ts";
import { getCookieName, isHttps, SITE_COOKIE_NAME } from "./_http.ts";

export interface GetSessionIdOptions {
  /**
   * The name of the cookie in the request. This must match the cookie name
   * used in {@linkcode handleCallback} and {@linkcode signOut}.
   */
  cookieName?: string;
}

/**
 * Gets the session ID from the cookie header of a request. This can be used to
 * check whether the client is signed-in by checking if the return value is
 * defined.
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
export function getSessionId(request: Request, options?: GetSessionIdOptions) {
  const cookieName = options?.cookieName ??
    getCookieName(SITE_COOKIE_NAME, isHttps(request.url));
  return getCookies(request.headers)[cookieName] as string | undefined;
}
