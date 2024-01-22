// Copyright 2023-2024 the Deno authors. All rights reserved. MIT license.
import { getSessionIdCookie } from "./_http.ts";
import { getSiteSession } from "./_kv.ts";

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
 * import { getSessionObject } from "https://deno.land/x/deno_kv_oauth@$VERSION/mod.ts";
 *
 * export async function handler(request: Request) {
 *   const sessionObject = await getSessionObject(request);
 *   return Response.json(sessionObject);
 * }
 * ```
 */
export async function getSessionObject<T>(
  request: Request,
  options?: GetSessionIdOptions,
): Promise<T | null> {
  const sessionId = getSessionIdCookie(request, options?.cookieName);
  if (sessionId === undefined) return null;
  return await getSiteSession<T>(sessionId);
}
