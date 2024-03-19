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
}

/**
 * Handles the OAuth callback request for the given OAuth configuration, and
 * then redirects the client to the success URL set in {@linkcode signIn}. The
 * request URL must match the redirect URL of the OAuth application.
 *
 * @param tokenCallback Function that uses the access token to get the session
 * object. This is used for fetching the user's profile from the OAuth
 * provider. An {@linkcode Error} will be thrown if this function resolves to a
 * `null` or `undefined` value. This is because `null` represents a non-existent
 * session object and `undefined` is too similar, and may be confusing, from
 * {@linkcode getSessionData}.
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
 *     getGitHubUser,
 *  );
 * }
 * ```
 */
// deno-lint-ignore ban-types
export async function handleCallback<T extends NonNullable<{}> = {}>(
  request: Request,
  oauthConfig: OAuth2ClientConfig,
  tokenCallback: (accessToken: string) => T | Promise<T>,
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

  const sessionData = await tokenCallback(tokens.accessToken);
  if (sessionData === null || sessionData === undefined) {
    throw new Error("tokenCallback() must resolve to a non-nullable value");
  }

  await setSiteSession(
    sessionId,
    sessionData,
    cookie.maxAge ? cookie.maxAge * SECOND : undefined,
  );

  return response;
}
