// Copyright 2023-2024 the Deno authors. All rights reserved. MIT license.
import {
  type Cookie,
  getCookies,
  OAuth2Client,
  type OAuth2ClientConfig,
  SECOND,
  setCookie,
} from "../deps.ts";
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
export interface HandleCallbackOptions<T extends unknown = unknown> {
  /**
   * Overwrites cookie properties set in the response. These must match the
   * cookie properties used in {@linkcode getSessionId} and
   * {@linkcode signOut}.
   */
  cookieOptions?: Partial<Cookie>;
  /**
   * Function that uses the access token to get the session object. This is
   * useful for fetching the user's profile from the OAuth provider. If
   * undefined, the session object will be set to `undefined`.
   *
   * @example
   * ```ts
   * import { handleCallback, createGitHubOAuthConfig } from "https://deno.land/x/deno_kv_oauth/mod.ts";
   *
   * const oauthConfig = createGitHubOAuthConfig();
   *
   * async function getGitHubUser(accessToken: string) {
   *   const response = await fetch("https://api.github.com/user", {
   *     headers: {
   *       Authorization: `bearer ${accessToken}`,
   *     },
   *   });
   *   if (!response.ok) throw new Error("Failed to fetch GitHub user profile");
   *   return await response.json();
   * }
   *
   * export async function handleOAuthCallback(request: Request) {
   *   return await handleCallback(
   *     request,
   *     oauthConfig,
   *     { sessionDataGetter: getGitHubUser},
   *  );
   * }
   * ```
   */
  sessionDataGetter?: (accessToken: string) => Promise<T>;
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
 *   return await handleCallback(
 *     request,
 *     oauthConfig,
 *   );
 * }
 * ```
 */
export async function handleCallback<T>(
  request: Request,
  oauthConfig: OAuth2ClientConfig,
  options?: HandleCallbackOptions<T>,
): Promise<Response> {
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
  const session = await options?.sessionDataGetter?.(tokens.accessToken);
  if (session === null) {
    throw new Error("options.sessionDataGetter() must return a non-null value");
  }

  await setSiteSession(
    sessionId,
    session,
    cookie.maxAge ? cookie.maxAge * SECOND : undefined,
  );

  return response;
}
