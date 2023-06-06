// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import { assert, getCookies, type OAuth2Client, setCookie } from "../deps.ts";
import {
  COOKIE_BASE,
  deleteOAuthSession,
  getCookieName,
  getOAuthSession,
  isSecure,
  OAUTH_COOKIE_NAME,
  redirect,
  setTokensBySiteSession,
  SITE_COOKIE_NAME,
} from "./_core.ts";

export async function handleCallback(
  request: Request,
  oauth2Client: OAuth2Client,
  redirectUrl = "/",
): Promise<Response> {
  // Get the OAuth session ID from the client's cookie and ensure it's defined
  const oauthCookieName = getCookieName(
    OAUTH_COOKIE_NAME,
    isSecure(request.url),
  );
  const oauthSessionId = getCookies(request.headers)[oauthCookieName];
  assert(oauthSessionId, `OAuth cookie not found`);

  // Get the OAuth session object stored in Deno KV and ensure it's defined
  const oauthSession = await getOAuthSession(oauthSessionId);
  assert(oauthSession, `OAuth session ${oauthSessionId} entry not found`);

  // Clear the stored OAuth session now that's no longer needed
  await deleteOAuthSession(oauthSessionId);

  // Generate a random site session ID for the new user cookie
  const sessionId = crypto.randomUUID();
  const tokens = await oauth2Client.code.getToken(
    request.url,
    oauthSession,
  );
  await setTokensBySiteSession(sessionId, tokens);

  const response = redirect(redirectUrl);
  setCookie(
    response.headers,
    {
      ...COOKIE_BASE,
      name: getCookieName(SITE_COOKIE_NAME, isSecure(request.url)),
      value: sessionId,
      secure: isSecure(request.url),
    },
  );
  return response;
}
