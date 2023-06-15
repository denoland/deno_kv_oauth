// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import { deleteCookie } from "../deps.ts";
import {
  deleteStoredTokensBySession,
  getCookieName,
  isSecure,
  redirect,
  SITE_COOKIE_NAME,
} from "./_core.ts";
import { getSessionId } from "./get_session_id.ts";

/**
 * Handles the sign-out process by:
 * 1. Getting the OAuth 2.0 session ID from the cookie in the given request. If no OAuth 2.0 session cookie is found, a response that redirects the client to the given redirect URL is returned.
 * 2. Deleting the stored OAuth 2.0 tokens from KV.
 * 3. Returning a response that invalidates the client's session cookie and redirects the client to the given redirect URL.
 *
 * @example
 * ```ts
 * import { signOut } from "https://deno.land/x/deno_kv_oauth/mod.ts";
 *
 * export async function signOutHandler(request: Request) {
 *   return await signOut(request, "/path-after-sign-out");
 * }
 * ```
 */
export async function signOut(request: Request, redirectUrl = "/") {
  const sessionId = await getSessionId(request);
  if (sessionId === null) return redirect(redirectUrl);

  await deleteStoredTokensBySession(sessionId);

  const response = redirect(redirectUrl);
  const cookieName = getCookieName(SITE_COOKIE_NAME, isSecure(request.url));
  deleteCookie(response.headers, cookieName, { path: "/" });
  return response;
}
