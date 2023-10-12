// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import {
  type Cookie,
  getCookies,
  OAuth2Client,
  type OAuth2ClientConfig,
  setCookie,
  Tokens,
} from "../deps.ts";
import {
  COOKIE_BASE,
  getCookieName,
  isHttps,
  OAUTH_COOKIE_NAME,
  redirect,
  SITE_COOKIE_NAME,
} from "./_http.ts";
import { getAndDeleteOAuthSession } from "./_kv.ts";

export interface HandleCallbackOptions {
  /** Overwrites cookie properties set in the response. These must match the
   * cookie properties used in {@linkcode getSessionId} and
   * {@linkcode signOut}.
   */
  cookieOptions?: Partial<Cookie>;
}

/**
 * Handles the OAuth callback request for the given OAuth configuration, and
 * then redirects the client to the success URL set in {@linkcode signIn}. The
 * request URL must match the redirect URL of the OAuth application.
 *
 * @example
 * ```ts
 * import { handleCallback, createGitHubOAuthConfig } from "https://deno.land/x/deno_kv_oauth/mod.ts";
 *
 * const oauthConfig = createGitHubOAuthConfig();
 *
 * export async function handleOAuthCallback(request: Request) {
 *   const { response, tokens, sessionId } = await handleCallback(
 *     request,
 *     oauthConfig,
 *   );
 *
 *    // Perform some actions with the `tokens` and `sessionId`.
 *
 *    return response;
 * }
 * ```
 */
export async function handleCallback(
  request: Request,
  oauthConfig: OAuth2ClientConfig,
  options?: HandleCallbackOptions,
): Promise<{
  response: Response;
  sessionId: string;
  tokens: Tokens;
}> {
  const oauthCookieName = getCookieName(
    OAUTH_COOKIE_NAME,
    isHttps(request.url),
  );
  const oauthSessionId = getCookies(request.headers)[oauthCookieName];
  if (oauthSessionId === undefined) throw new Error("OAuth cookie not found");
  const oauthSession = await getAndDeleteOAuthSession(oauthSessionId);

  const tokens = await new OAuth2Client(oauthConfig)
    .code.getToken(request.url, oauthSession);

  const sessionId = crypto.randomUUID();

  const response = redirect(oauthSession.successUrl);
  setCookie(
    response.headers,
    {
      ...COOKIE_BASE,
      name: getCookieName(SITE_COOKIE_NAME, isHttps(request.url)),
      value: sessionId,
      secure: isHttps(request.url),
      ...options?.cookieOptions,
    },
  );
  return {
    response,
    sessionId,
    tokens,
  };
}
