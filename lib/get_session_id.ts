// Copyright 2023-2024 the Deno authors. All rights reserved. MIT license.
import { getSessionIdCookie } from "./_http.ts";
import { isSiteSession } from "./_kv.ts";

/** Options for {@linkcode getSessionId}. */
export interface GetSessionIdOptions {
  /**
   * The name of the cookie in the request. This must match the cookie name
   * used in {@linkcode handleCallback} and {@linkcode signOut}.
   */
  cookieName?: string;
}

/**
 * Gets the session ID from the cookie header of a request. This can be used to
 * check whether the client is signed-in and whether the session ID was created
 * on the server by checking if the return value is defined.
 *
 * @example
 * ```ts
 * import { getSessionId } from "https://deno.land/x/deno_kv_oauth/mod.ts";
 *
 * export async function handler(request: Request) {
 *   const sessionId = await getSessionId(request);
 *   const hasSessionIdCookie = sessionId !== undefined;
 *
 *   return Response.json({ sessionId, hasSessionIdCookie });
 * }
 * ```
 *
 * @deprecated Use {@linkcode createHelpers} instead. This will be removed in v0.12.0.
 */
export async function getSessionId(
  request: Request,
  options?: GetSessionIdOptions,
): Promise<string | undefined> {
  const sessionId = getSessionIdCookie(request, options?.cookieName);
  return (sessionId !== undefined && await isSiteSession(sessionId))
    ? sessionId
    : undefined;
}
