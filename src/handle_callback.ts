// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import {
  assert,
  getCookies,
  type OAuth2Client,
  SECOND,
  setCookie,
} from "../deps.ts";
import {
  assertIsSessionKey,
  COOKIE_BASE,
  deleteOAuthSession,
  getCookieName,
  getOAuthSession,
  isSecure,
  OAUTH_COOKIE_NAME,
  parseJsonCookie,
  redirect,
  SessionKey,
  setTokensBySession,
  SITE_COOKIE_NAME,
  stringifySessionKeyCookie,
} from "./core.ts";

/**
 * Handles the OAuth 2.0 callback request for a given OAuth 2.0 client, and then redirects the client to the given redirect URL.
 *
 * It does this by:
 * 1. Getting the OAuth 2.0 session key from the cookie in the given request.
 * 2. Getting, then deleting, the OAuth 2.0 session object from KV using the OAuth 2.0 session key. The OAuth 2.0 session object was generated in the sign-in process.
 * 3. Getting the OAuth 2.0 tokens from the given OAuth 2.0 client using the OAuth 2.0 session object.
 * 4. Storing the OAuth 2.0 tokens in KV using a generated session key.
 * 5. Returning a response that sets a session cookie and redirects the client to the given redirect URL, the access token and the session key for processing during the callback handler.
 *
 * @param request The HTTP request from the client. The URL of the request must match that of the OAuth 2.0 redirect URL.
 * @param redirectUrl The absolute URL or path that the client is redirected to after callback handling is complete.
 *
 * @example
 * ```ts
 * import { handleCallback, createGitHubOAuth2Client } from "https://deno.land/x/deno_kv_oauth@$VERSION/mod.ts";
 *
 * const oauth2Client = createGitHubOAuth2Client();
 *
 * export async function handleOAuthCallback(request: Request) {
 *   const { response, accessToken, sessionKey } = await handleCallback(
 *     request,
 *     oauth2Client,
 *     "/redirect-path-after-handle"
 *   );
 *
 *    // Perform some actions with the `accessToken` and `sessionKey`.
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
  const oauthSessionKey = parseJsonCookie(
    getCookies(request.headers)[oauthCookieName],
  );
  assertIsSessionKey(oauthSessionKey, "OAuth 2.0 cookie is not session key");

  const oauthSession = await getOAuthSession(oauthSessionKey);
  assert(oauthSession, `OAuth 2.0 session ${oauthSessionKey} entry not found`);
  await deleteOAuthSession(oauthSessionKey);

  // This is as far as automated testing can go
  const tokens = await oauth2Client.code.getToken(
    request.url,
    oauthSession,
  );

  const sessionKey: SessionKey = [
    Date.now() + (COOKIE_BASE.maxAge * SECOND),
    crypto.randomUUID(),
  ];
  await setTokensBySession(sessionKey, tokens);

  const response = redirect(redirectUrl);
  setCookie(
    response.headers,
    {
      ...COOKIE_BASE,
      name: getCookieName(SITE_COOKIE_NAME, isSecure(request.url)),
      value: stringifySessionKeyCookie(sessionKey),
      secure: isSecure(request.url),
    },
  );
  return {
    response,
    sessionKey,
    accessToken: tokens.accessToken,
  };
}
