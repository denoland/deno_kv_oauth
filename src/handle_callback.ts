// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import { getCookies, type OAuth2Client, setCookie } from "../deps.ts";
import {
  assert,
  COOKIE_BASE,
  deleteOAuthSession,
  getCookieName,
  getOAuthSession,
  isSecure,
  OAUTH_COOKIE_NAME,
  redirect,
  setTokensBySession,
  SITE_COOKIE_NAME,
} from "./_core.ts";

/**
 * Handles the OAuth 2.0 callback request for a given OAuth 2.0 client, and then redirects the client to the given redirect URL.
 *
 * It does this by:
 * 1. Getting the OAuth 2.0 session ID from the cookie in the given request.
 * 2. Getting, then deleting, the OAuth 2.0 session object from KV using the OAuth 2.0 session ID. The OAuth 2.0 session object was generated in the sign-in process.
 * 3. Getting the OAuth 2.0 tokens from the given OAuth 2.0 client using the OAuth 2.0 session object.
 * 4. Storing the OAuth 2.0 tokens in KV using a generated session ID.
 * 5. Returning a response that sets a session cookie and redirects the client to the given redirect URL, the access token and the session ID for processing during the callback handler.
 *
 * @example
 * ```ts
 * import { handleCallback, createGitHubOAuth2Client } from "https://deno.land/x/deno_kv_oauth/mod.ts";
 *
 * const oauth2Client = createGitHubOAuth2Client();
 *
 * export async function handleOAuthCallback(request: Request) {
 *   const { response, accessToken, sessionId } = await handleCallback(
 *     request,
 *     oauth2Client,
 *     "/redirect-path-after-handle"
 *   );
 *
 *    // Perform some actions with the `accessToken` and `sessionId`.
 *
 *    return response;
 * }
 * ```
 */
export async function handleCallback(
  request: Request,
  oauth2Client: OAuth2Client,
  redirectUrl = "/",
) {
  const oauthCookieName = getCookieName(
    OAUTH_COOKIE_NAME,
    isSecure(request.url),
  );
  const oauthSessionId = getCookies(request.headers)[oauthCookieName];
  assert(oauthSessionId, `OAuth 2.0 cookie not found`);

  const oauthSession = await getOAuthSession(oauthSessionId);
  assert(oauthSession, `OAuth 2.0 session ${oauthSessionId} entry not found`);
  await deleteOAuthSession(oauthSessionId);

  // This is as far as automated testing can go
  const tokens = await oauth2Client.code.getToken(
    request.url,
    oauthSession,
  );

  const sessionId = crypto.randomUUID();
  await setTokensBySession(sessionId, tokens);

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
  return {
    response,
    sessionId,
    accessToken: tokens.accessToken,
  };
}
