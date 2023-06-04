// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import { assert, getCookies } from "../deps.ts";
import {
  getCookieName,
  getTokensBySiteSession,
  isSecure,
  SITE_COOKIE_NAME,
} from "./_core.ts";

export async function getSessionTokens(request: Request) {
  const siteCookieName = getCookieName(SITE_COOKIE_NAME, isSecure(request.url));
  const siteSessionId = getCookies(request.headers)[siteCookieName];
  assert(siteSessionId, `Site cookie not found`);

  const tokens = await getTokensBySiteSession(siteSessionId);
  assert(tokens, `Tokens by site session ID ${siteSessionId} not found`);

  return tokens;
}
