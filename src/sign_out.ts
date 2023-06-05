// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import { deleteCookie, getCookies } from "../deps.ts";
import {
  deleteTokensBySiteSession,
  getCookieName,
  isSecure,
  redirect,
  SITE_COOKIE_NAME,
} from "./_core.ts";
import { isSignedIn } from "./is_signed_in.ts";

export async function signOut(request: Request, redirectUrl = "/") {
  if (!isSignedIn(request)) return redirect(redirectUrl);

  const cookieName = getCookieName(SITE_COOKIE_NAME, isSecure(request.url));
  const siteSessionId = getCookies(request.headers)[cookieName];
  await deleteTokensBySiteSession(siteSessionId);

  const response = redirect(redirectUrl);
  deleteCookie(response.headers, cookieName, { path: "/" });
  return response;
}
