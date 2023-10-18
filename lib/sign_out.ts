// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import { Cookie, deleteCookie } from "../deps.ts";
import {
  COOKIE_BASE,
  getCookieName,
  getSessionIdCookie,
  getSuccessUrl,
  isHttps,
  redirect,
  SITE_COOKIE_NAME,
} from "./_http.ts";
import { deleteSiteSession } from "./_kv.ts";

export interface SignOutOptions {
  /**
   * Overwrites cookie properties set in the response. These must match the
   * cookie properties used in {@linkcode getSessionId} and
   * {@linkcode handleCallback}.
   */
  cookieOptions?: Partial<Pick<Cookie, "name" | "path" | "domain">>;
}

/**
 * Handles the sign-out process, and then redirects the client to the given
 * success URL.
 *
 * @see {@link https://deno.land/x/deno_kv_oauth#redirects-after-sign-in-and-sign-out}
 *
 * @example
 * ```ts
 * import { signOut } from "https://deno.land/x/deno_kv_oauth@$VERSION/mod.ts";
 *
 * export async function signOutHandler(request: Request) {
 *   return await signOut(request);
 * }
 * ```
 */
export async function signOut(
  request: Request,
  options?: SignOutOptions,
): Promise<Response> {
  const successUrl = getSuccessUrl(request);
  const response = redirect(successUrl);

  const sessionId = getSessionIdCookie(request, options?.cookieOptions?.name);
  if (sessionId === undefined) return response;
  await deleteSiteSession(sessionId);

  const cookieName = options?.cookieOptions?.name ??
    getCookieName(SITE_COOKIE_NAME, isHttps(request.url));
  deleteCookie(response.headers, cookieName, {
    path: COOKIE_BASE.path,
    ...options?.cookieOptions,
  });
  return response;
}
