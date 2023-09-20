// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import {
  assert,
  getCookies,
  OAuth2Client,
  OAuth2ClientConfig,
  setCookie,
} from "../deps.ts";
import {
  COOKIE_BASE,
  deleteOAuthSession,
  getCookieName,
  getOAuthSession,
  isSecure,
  OAUTH_COOKIE_NAME,
  redirect,
  setTokens,
  SITE_COOKIE_NAME,
} from "./_core.ts";

/**
 * Handles the OAuth callback request for the given OAuth configuration, and
 * then redirects the client to the success URL set in {@linkcode signIn}.
 *
 * It does this by:
 * 1. Getting the OAuth session ID from the cookie in the given request.
 * 2. Getting, then deleting, the OAuth session object from KV using the
 * OAuth session ID. The OAuth session object was generated in the sign-in
 * process.
 * 3. Getting the OAuth tokens from the given OAuth configuration using the
 * OAuth session object.
 * 4. Storing the OAuth tokens in KV using a generated session ID.
 * 5. Returning a response that sets a session cookie and redirects the client
 * to the success URL set in {@linkcode signIn}, the access token and the
 * session ID for processing during the callback handler.
 *
 * @param request The HTTP request from the client. The URL of the request must
 * match that of the OAuth redirect URL.
 *
 * @example
 * ```ts
 * import { handleCallback, createGitHubOAuthConfig } from "https://deno.land/x/deno_kv_oauth@$VERSION/mod.ts";
 *
 * const oauthConfig = createGitHubOAuthConfig();
 *
 * export async function handleOAuthCallback(request: Request) {
 *   const { response, accessToken, sessionId } = await handleCallback(
 *     request,
 *     oauthConfig,
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
  /** @see {@linkcode OAuth2ClientConfig} */
  oauthConfig: OAuth2ClientConfig,
) {
  const oauthCookieName = getCookieName(
    OAUTH_COOKIE_NAME,
    isSecure(request.url),
  );
  const oauthSessionId = getCookies(request.headers)[oauthCookieName];
  assert(oauthSessionId, `OAuth cookie not found`);

  const oauthSession = await getOAuthSession(oauthSessionId);
  assert(oauthSession, `OAuth session ${oauthSessionId} entry not found`);
  await deleteOAuthSession(oauthSessionId);

  // This is as far as automated testing can go
  const tokens = await new OAuth2Client(oauthConfig)
    .code.getToken(request.url, oauthSession);

  const sessionId = crypto.randomUUID();
  await setTokens(sessionId, tokens);

  const response = redirect(oauthSession.successUrl ?? "/");
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
