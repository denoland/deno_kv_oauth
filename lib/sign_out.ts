// Copyright 2023-2024 the Deno authors. All rights reserved. MIT license.
import { type Cookie, deleteCookie } from "@std/http";
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

/** Options for {@linkcode signOut}. */
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
 * @see {@link https://github.com/denoland/deno_kv_oauth/tree/main#redirects-after-sign-in-and-sign-out}
 *
 * @example
 * ```ts
 * import { signOut } from "jsr:@deno/kv-oauth";
 *
 * export async function signOutHandler(request: Request) {
 *   return await signOut(request);
 * }
 * ```
 *
 * @deprecated Use {@linkcode createHelpers} instead. This will be removed in v0.12.0.
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
