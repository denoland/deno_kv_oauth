// Copyright 2023 the Deno authors. All rights reserved. MIT license.

import { type Cookie, OAuth2ClientConfig } from "../deps.ts";
import { getSessionId } from "./get_session_id.ts";
import { handleCallback } from "./handle_callback.ts";
import { signIn, type SignInOptions } from "./sign_in.ts";
import { signOut } from "./sign_out.ts";

export interface CreateHelpersOptions {
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
) {
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
