// Copyright 2023-2024 the Deno authors. All rights reserved. MIT license.

import type {
  OAuth2ClientConfig,
  Tokens,
} from "https://deno.land/x/oauth2_client@v1.0.2/mod.ts";
import type { Cookie } from "@std/http";
import { getSessionId } from "./get_session_id.ts";
import { handleCallback } from "./handle_callback.ts";
import { signIn, type SignInOptions } from "./sign_in.ts";
import { signOut } from "./sign_out.ts";

export type { SignInOptions };

/** High-level OAuth 2.0 functions */
export interface Helpers {
  /**
   * Handles the sign-in request and process for the given OAuth configuration
   * and redirects the client to the authorization URL.
   *
   * @see {@link https://github.com/denoland/deno_kv_oauth/tree/main#redirects-after-sign-in-and-sign-out}
   *
   * @example
   * ```ts
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
   * @example
   * ```ts
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
   * @example
   * ```ts
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
   * @example
   * ```ts
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
 * @example
 * ```ts
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
      return await signIn(request, oauthConfig, options);
    },
    async handleCallback(request: Request) {
      return await handleCallback(request, oauthConfig, {
        cookieOptions: options?.cookieOptions,
      });
    },
    async signOut(request: Request) {
      return await signOut(request, { cookieOptions: options?.cookieOptions });
    },
    async getSessionId(request: Request) {
      return await getSessionId(request, {
        cookieName: options?.cookieOptions?.name,
      });
    },
  };
}
