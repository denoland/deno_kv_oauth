// Copyright 2023-2024 the Deno authors. All rights reserved. MIT license.
import {
  OAuth2Client,
  type OAuth2ClientConfig,
  type Tokens,
} from "@cmd-johnson/oauth2-client";
import { SECOND } from "@std/datetime";
import { type Cookie, deleteCookie, getCookies, setCookie } from "@std/http";
import {
  COOKIE_BASE,
  getCookieName,
  getSessionIdCookie,
  getSuccessUrl,
  isHttps,
  OAUTH_COOKIE_NAME,
  redirect,
  SITE_COOKIE_NAME,
} from "./_http.ts";
import {
  deleteSiteSession,
  getAndDeleteOAuthSession,
  isSiteSession,
  setOAuthSession,
  setSiteSession,
} from "./_kv.ts";

/** Options for {@linkcode signIn}. */
export interface SignInOptions {
  /** URL parameters that are appended to the authorization URI, if defined. */
  urlParams?: Record<string, string>;
}

/** High-level OAuth 2.0 functions */
export interface Helpers {
  /**
   * Handles the sign-in request and process for the given OAuth configuration
   * and redirects the client to the authorization URL.
   *
   * @see {@link https://github.com/denoland/deno_kv_oauth/tree/main#redirects-after-sign-in-and-sign-out}
   *
   * @example Usage
   * ```ts ignore
   * import { createGitHubOAuthConfig, createHelpers } from "jsr:@deno/kv-oauth";
   *
   * const oauthConfig = createGitHubOAuthConfig();
   * const { signIn } = createHelpers(oauthConfig);
   *
   * Deno.serve(async (request) => await signIn(request));
   * ```
   */
  signIn(request: Request, options?: SignInOptions): Promise<Response>;
  /**
   * Handles the OAuth callback request for the given OAuth configuration, and
   * then redirects the client to the success URL set in
   * {@linkcode Handlers.signIn}. The request URL must match the redirect URL
   * of the OAuth application.
   *
   * @example Usage
   * ```ts ignore
   * import { createGitHubOAuthConfig, createHelpers } from "jsr:@deno/kv-oauth";
   *
   * const oauthConfig = createGitHubOAuthConfig();
   * const { handleCallback } = createHelpers(oauthConfig);
   *
   * Deno.serve(async (request) => {
   *   const { response } = await handleCallback(request);
   *   return response;
   * });
   * ```
   */
  handleCallback(request: Request): Promise<{
    response: Response;
    sessionId: string;
    tokens: Tokens;
  }>;
  /**
   * Handles the sign-out process, and then redirects the client to the given
   * success URL.
   *
   * @see {@link https://github.com/denoland/deno_kv_oauth/tree/main#redirects-after-sign-in-and-sign-out}
   *
   * @example Usage
   * ```ts ignore
   * import { createGitHubOAuthConfig, createHelpers } from "jsr:@deno/kv-oauth";
   *
   * const oauthConfig = createGitHubOAuthConfig();
   * const { signOut } = createHelpers(oauthConfig);
   *
   * Deno.serve(async (request) => await signOut(request));
   * ```
   */
  signOut(request: Request): Promise<Response>;
  /**
   * Gets the session ID from the cookie header of a request. This can be used to
   * check whether the client is signed-in and whether the session ID was created
   * on the server by checking if the return value is defined.
   *
   * @example Usage
   * ```ts ignore
   * import { createGitHubOAuthConfig, createHelpers } from "jsr:@deno/kv-oauth";
   *
   * const oauthConfig = createGitHubOAuthConfig();
   * const { getSessionId } = createHelpers(oauthConfig);
   *
   * Deno.serve(async (request) => {
   *   const sessionId = await getSessionId(request);
   *   return Response.json({ sessionId });
   * });
   * ```
   */
  getSessionId(request: Request): Promise<string | undefined>;
}

/** Options for {@linkcode createHelpers}. */
export interface CreateHelpersOptions {
  /**
   * Options for overwriting the default cookie options throughout each of the
   * helpers.
   */
  cookieOptions?: Partial<Cookie>;
}

/**
 * Creates the full set of helpers with the given OAuth configuration and
 * options.
 *
 * @example Usage
 * ```ts ignore
 * // server.ts
 * import {
 *   createGitHubOAuthConfig,
 *   createHelpers,
 * } from "jsr:@deno/kv-oauth";
 *
 * const {
 *   signIn,
 *   handleCallback,
 *   signOut,
 *   getSessionId,
 * } = createHelpers(createGitHubOAuthConfig(), {
 *   cookieOptions: {
 *     name: "__Secure-triple-choc",
 *     domain: "news.site",
 *   },
 * });
 *
 * async function handler(request: Request) {
 *   const { pathname } = new URL(request.url);
 *   switch (pathname) {
 *     case "/oauth/signin":
 *       return await signIn(request);
 *     case "/oauth/callback":
 *       const { response } = await handleCallback(request);
 *       return response;
 *     case "/oauth/signout":
 *       return await signOut(request);
 *     case "/protected-route":
 *       return await getSessionId(request) === undefined
 *         ? new Response("Unauthorized", { status: 401 })
 *         : new Response("You are allowed");
 *     default:
 *       return new Response(null, { status: 404 });
 *   }
 * }
 *
 * Deno.serve(handler);
 * ```
 */
export function createHelpers(
  oauthConfig: OAuth2ClientConfig,
  options?: CreateHelpersOptions,
): Helpers {
  return {
    async signIn(request: Request, options?: SignInOptions) {
      const state = crypto.randomUUID();
      const { uri, codeVerifier } = await new OAuth2Client(oauthConfig)
        .code.getAuthorizationUri({ state });

      if (options?.urlParams) {
        Object.entries(options.urlParams).forEach(([key, value]) =>
          uri.searchParams.append(key, value)
        );
      }

      const oauthSessionId = crypto.randomUUID();
      const cookie: Cookie = {
        ...COOKIE_BASE,
        name: getCookieName(OAUTH_COOKIE_NAME, isHttps(request.url)),
        value: oauthSessionId,
        secure: isHttps(request.url),
        /**
         * A maximum authorization code lifetime of 10 minutes is recommended.
         * This cookie lifetime matches that value.
         *
         * @see {@link https://datatracker.ietf.org/doc/html/rfc6749#section-4.1.2}
         */
        maxAge: 10 * 60,
      };
      const successUrl = getSuccessUrl(request);
      await setOAuthSession(
        oauthSessionId,
        { state, codeVerifier, successUrl },
        {
          expireIn: cookie.maxAge! * SECOND,
        },
      );
      const response = redirect(uri.toString());
      setCookie(response.headers, cookie);
      return response;
    },
    async handleCallback(request: Request) {
      const oauthCookieName = getCookieName(
        OAUTH_COOKIE_NAME,
        isHttps(request.url),
      );
      const oauthSessionId = getCookies(request.headers)[oauthCookieName];
      if (oauthSessionId === undefined) {
        throw new Error("OAuth cookie not found");
      }
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
    },
    async signOut(request: Request) {
      const successUrl = getSuccessUrl(request);
      const response = redirect(successUrl);

      const sessionId = getSessionIdCookie(
        request,
        options?.cookieOptions?.name,
      );
      if (sessionId === undefined) return response;
      await deleteSiteSession(sessionId);

      const cookieName = options?.cookieOptions?.name ??
        getCookieName(SITE_COOKIE_NAME, isHttps(request.url));
      deleteCookie(response.headers, cookieName, {
        path: COOKIE_BASE.path,
        ...options?.cookieOptions,
      });
      return response;
    },
    async getSessionId(request: Request) {
      const sessionId = getSessionIdCookie(
        request,
        options?.cookieOptions?.name,
      );
      return (sessionId !== undefined && await isSiteSession(sessionId))
        ? sessionId
        : undefined;
    },
  };
}
