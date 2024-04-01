// Copyright 2023-2024 the Deno authors. All rights reserved. MIT license.
import {
  OAuth2Client,
  type OAuth2ClientConfig,
  type Tokens,
} from "https://deno.land/x/oauth2_client@v1.0.2/mod.ts";
import { SECOND } from "@std/datetime/constants";
import { type Cookie, getCookies, setCookie } from "@std/http";
import {
  COOKIE_BASE,
  getCookieName,
  isHttps,
  OAUTH_COOKIE_NAME,
  redirect,
  SITE_COOKIE_NAME,
} from "./_http.ts";
import { getAndDeleteOAuthSession, setSiteSession } from "./_kv.ts";

/** Options for {@linkcode handleCallback}. */
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
 * import { handleCallback, createGitHubOAuthConfig } from "jsr:@deno/kv-oauth";
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
 *
 * @deprecated Use {@linkcode createHelpers} instead. This will be removed in v0.12.0.
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
  const cookie: Cookie = {
    ...COOKIE_BASE,
    name: getCookieName(SITE_COOKIE_NAME, isHttps(request.url)),
    value: sessionId,
    secure: isHttps(request.url),
    ...options?.cookieOptions,
  };
  setCookie(response.headers, cookie);
  await setSiteSession(
    sessionId,
    cookie.maxAge ? cookie.maxAge * SECOND : undefined,
  );

  return {
    response,
    sessionId,
    tokens,
  };
}
