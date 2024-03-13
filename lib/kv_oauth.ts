// Copyright 2023-2024 the Deno authors. All rights reserved. MIT license.

import {
  Cookie,
  deleteCookie,
  getCookies,
  OAuth2Client,
  type OAuth2ClientConfig,
  SECOND,
  setCookie,
  Tokens,
} from "../deps.ts";
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

/** Options for {@linkcode createKvOAuth}. */
export interface KvOAuthOptions {
  /**
   * Session cookie options used in {@linkcode KvOAuth.handleCallback},
   * {@linkcode KvOAuth.getSessionId}, and {@linkcode KvOAuth.signOut}.
   */
  cookieOptions?: Partial<Cookie>;
}

/**
 * A class instance that handles the sign-in, sign-out, callback, and session
 * management for OAuth 2.0 using {@link https://deno.com/kv | Deno KV }.
 *
 * @example
 * ```ts
 * import { KvOAuth, createGitHubOAuthConfig } from "https://deno.land/x/deno_kv_oauth/mod.ts";
 *
 * const oauthConfig = createGitHubOAuthConfig();
 * const kvOAuth = new KvOAuth(oauthConfig);
 *
 * async function handler(request: Request) {
 *   const { pathname } = new URL(request.url);
 *   switch (pathname) {
 *     case "/oauth/sign-in":
 *       return await kvOAuth.signIn(request);
 *     case "/oauth/callback":
 *       const { response } = await kvOAuth.handleCallback(request);
 *       return response;
 *     case "/oauth/sign-out":
 *       return await kvOAuth.signOut(request);
 *     case "/protected-route":
 *       return await kvOAuth.getSessionId(request) === undefined
 *         ? new Response("Unauthorized", { status: 401 })
 *         : new Response("Authorized");
 *     default:
 *       return new Response("Not Found", { status: 404 });
 *   }
 * }
 *
 * Deno.serve(handler);
 * ```
 */
export class KvOAuth {
  #oauthClient: OAuth2Client;
  #options: KvOAuthOptions;

  /** Constructs a new instance. */
  constructor(oauthConfig: OAuth2ClientConfig, options?: KvOAuthOptions) {
    this.#oauthClient = new OAuth2Client(oauthConfig);
    this.#options = options ?? {};
  }

  /**
   * Handles the sign-in request and process for the given OAuth configuration
   * and redirects the client to the authorization URL.
   *
   * @see {@link https://deno.land/x/deno_kv_oauth#redirects-after-sign-in-and-sign-out}
   *
   * @example
   * ```ts
   * import { KvOAuth, createGitHubOAuthConfig } from "https://deno.land/x/deno_kv_oauth/mod.ts";
   *
   * const oauthConfig = createGitHubOAuthConfig();
   * const kvOAuth = new KvOAuth(oauthConfig);
   *
   * async function handleSignIn(request: Request) {
   *   return await kvOAuth.signIn(request);
   * }
   *
   * Deno.serve(handleSignIn);
   * ```
   */
  async signIn(request: Request, options?: {
    /** URL parameters that are appended to the authorization URI, if defined. */
    urlParams?: Record<string, string>;
  }): Promise<Response> {
    const state = crypto.randomUUID();
    const { uri, codeVerifier } = await this.#oauthClient.code
      .getAuthorizationUri({ state });

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
    await setOAuthSession(oauthSessionId, { state, codeVerifier, successUrl }, {
      expireIn: cookie.maxAge! * SECOND,
    });
    const response = redirect(uri.toString());
    setCookie(response.headers, cookie);
    return response;
  }

  /**
   * Handles the OAuth callback request for the given OAuth configuration, and
   * then redirects the client to the success URL set in {@linkcode signIn}. The
   * request URL must match the redirect URL of the OAuth application.
   *
   * @example
   * ```ts
   * import { KvOAuth, createGitHubOAuthConfig } from "https://deno.land/x/deno_kv_oauth/mod.ts";
   *
   * const oauthConfig = createGitHubOAuthConfig();
   * const kvOAuth = new KvOAuth(oauthConfig);
   *
   * async function handleCallback(request: Request) {
   *   const { response, tokens, sessionId } = await kvOAuth.handleCallback(request);
   *
   *   // Perform some actions with the `tokens` and `sessionId`.
   *
   *   return response;
   * }
   *
   * Deno.serve(handleCallback);
   * ```
   */
  async handleCallback(request: Request): Promise<{
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

    const tokens = await this.#oauthClient.code.getToken(
      request.url,
      oauthSession,
    );

    const sessionId = crypto.randomUUID();
    const response = redirect(oauthSession.successUrl);
    const cookie: Cookie = {
      ...COOKIE_BASE,
      name: getCookieName(SITE_COOKIE_NAME, isHttps(request.url)),
      value: sessionId,
      secure: isHttps(request.url),
      ...this.#options?.cookieOptions,
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

  /**
   * Gets the session ID from the cookie header of a request. This can be used to
   * check whether the client is signed-in and whether the session ID was created
   * on the server by checking if the return value is defined.
   *
   * @example
   * ```ts
   * import { KvOAuth, createGitHubOAuthConfig } from "https://deno.land/x/deno_kv_oauth/mod.ts";
   *
   * const oauthConfig = createGitHubOAuthConfig();
   * const kvOAuth = new KvOAuth(oauthConfig);
   *
   * async function handler(request: Request) {
   *   const sessionId = await kvOAuth.getSessionId(request);
   *   const hasSessionIdCookie = sessionId !== undefined;
   *
   *   return Response.json({ sessionId, hasSessionIdCookie });
   * }
   *
   * Deno.serve(handler);
   * ```
   */
  async getSessionId(request: Request): Promise<string | undefined> {
    const sessionId = getSessionIdCookie(
      request,
      this.#options?.cookieOptions?.name,
    );
    return (sessionId !== undefined && await isSiteSession(sessionId))
      ? sessionId
      : undefined;
  }

  /**
   * Handles the sign-out process, and then redirects the client to the given
   * success URL.
   *
   * @see {@link https://deno.land/x/deno_kv_oauth#redirects-after-sign-in-and-sign-out}
   *
   * @example
   * ```ts
   * import { KvOAuth, createGitHubOAuthConfig } from "https://deno.land/x/deno_kv_oauth/mod.ts";
   *
   * const oauthConfig = createGitHubOAuthConfig();
   * const kvOAuth = new KvOAuth(oauthConfig);
   *
   * async function handleSignOut(request: Request) {
   *   return await kvOAuth.signOut(request);
   * }
   *
   * Deno.serve(handleSignOut);
   * ```
   */
  async signOut(request: Request): Promise<Response> {
    const successUrl = getSuccessUrl(request);
    const response = redirect(successUrl);

    const sessionId = getSessionIdCookie(
      request,
      this.#options?.cookieOptions?.name,
    );
    if (sessionId === undefined) return response;
    await deleteSiteSession(sessionId);

    const cookieName = this.#options?.cookieOptions?.name ??
      getCookieName(SITE_COOKIE_NAME, isHttps(request.url));
    deleteCookie(response.headers, cookieName, {
      path: COOKIE_BASE.path,
      ...this.#options?.cookieOptions,
    });
    return response;
  }
}
