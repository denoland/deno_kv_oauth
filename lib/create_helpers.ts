// Copyright 2023-2024 the Deno authors. All rights reserved. MIT license.

import { type Cookie, OAuth2ClientConfig } from "../deps.ts";
import { getSessionData } from "./get_session_data.ts";
import { handleCallback } from "./handle_callback.ts";
import { signIn, type SignInOptions } from "./sign_in.ts";
import { signOut } from "./sign_out.ts";

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
 * } from "https://deno.land/x/deno_kv_oauth/mod.ts";
 *
 * const {
 *   signIn,
 *   handleCallback,
 *   signOut,
 *   getSessionData,
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
 *       return await handleCallback(request);
 *     case "/oauth/signout":
 *       return await signOut(request);
 *     case "/protected-route":
 *       return await getSessionData(request) === null
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
export function createHelpers<T>(
  oauthConfig: OAuth2ClientConfig,
  options?: CreateHelpersOptions,
): {
  signIn(request: Request, options?: SignInOptions): Promise<Response>;
  handleCallback(
    request: Request,
    tokenHandler: (accessToken: string) => T | Promise<T>,
  ): Promise<Response>;
  signOut(request: Request): Promise<Response>;
  getSessionData(request: Request): Promise<T | null>;
} {
  return {
    async signIn(request: Request, options?: SignInOptions) {
      return await signIn(request, oauthConfig, options);
    },
    async handleCallback(
      request: Request,
      tokenHandler: (accessToken: string) => T | Promise<T>,
    ) {
      return await handleCallback(request, oauthConfig, tokenHandler, {
        cookieOptions: options?.cookieOptions,
      });
    },
    async signOut(request: Request) {
      return await signOut(request, { cookieOptions: options?.cookieOptions });
    },
    async getSessionData(request: Request) {
      return await getSessionData<T>(request, {
        cookieName: options?.cookieOptions?.name,
      });
    },
  };
}
