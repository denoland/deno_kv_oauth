// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import { getCookies } from "../deps.ts";
import { getCookieName, isSecure, SITE_COOKIE_NAME } from "./_core.ts";

export function isSignedIn(request: Request) {
  const cookieName = getCookieName(SITE_COOKIE_NAME, isSecure(request.url));
  return Boolean(getCookies(request.headers)[cookieName]);
}
