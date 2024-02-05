// Copyright 2023-2024 the Deno authors. All rights reserved. MIT license.
import { getSessionIdCookie } from "./_http.ts";
import { getSiteSession } from "./_kv.ts";

/** Options for {@linkcode getSessionData}. */
export interface GetSessionDataOptions {
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
 * @returns The session data object returned from {@linkcode sessionDataGetter}
 * in {@linkcode handleCallback} or `null` if the session cookie either doesn't
 * exist or the session entry doesn't exist in the database.
 *
 * @example
 * ```ts
 * import { getSessionData } from "https://deno.land/x/deno_kv_oauth@$VERSION/mod.ts";
 *
 * export async function handler(request: Request) {
 *   const sessionData = await getSessionData(request);
 *   return sessionData === null
 *     ? new Response("Unauthorized", { status: 401 })
 *     : Response.json(sessionData);
 * }
 * ```
 */
export async function getSessionData<T>(
  request: Request,
  options?: GetSessionDataOptions,
): Promise<T | null> {
  const sessionId = getSessionIdCookie(request, options?.cookieName);
  if (sessionId === undefined) return null;
  return await getSiteSession<T>(sessionId);
}
