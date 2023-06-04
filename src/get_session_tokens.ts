// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import { getCookies } from "../deps.ts";
import {
  getCookieName,
  getTokensBySiteSession,
  isSecure,
  SITE_COOKIE_NAME,
} from "./_core.ts";

export async function getSessionTokens(request: Request) {
  const siteCookieName = getCookieName(SITE_COOKIE_NAME, isSecure(request.url));
  const siteSessionId = getCookies(request.headers)[siteCookieName];

  return siteSessionId ? await getTokensBySiteSession(siteSessionId) : null;
}
