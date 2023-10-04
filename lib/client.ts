// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import { signIn, type SignInOptions } from "./sign_in.ts";
import { handleCallback } from "./handle_callback.ts";
import { signOut } from "./sign_out.ts";
import type { Cookie, OAuth2ClientConfig } from "../deps.ts";
import { getSessionId } from "./get_session_id.ts";

export interface ClientOptions {
  cookieOptions?: Partial<Cookie>;
}

export class Client {
  oauthConfig: OAuth2ClientConfig;
  options?: ClientOptions;

  constructor(oauthConfig: OAuth2ClientConfig, options?: ClientOptions) {
    this.oauthConfig = oauthConfig;
    this.options = options;
  }

  /**
   * Handles the sign-in request and process for the given OAuth configuration
   * and redirects the client to the authorization URL.
   *
   * @see {@link https://deno.land/x/deno_kv_oauth#redirects-after-sign-in-and-sign-out}
   *
   * @example
   * ```ts
   * import {
   *   Client,
   *   createGitHubOAuthConfig
   * } from "https://deno.land/x/deno_kv_oauth@$VERSION/mod.ts";
   *
   * const kvOAuthClient = new Client(createGitHubOAuthConfig());
   *
   * export async function handleSignIn(request: Request) {
   *  return await kvOAuthClient.signIn(request);
   * }
   * ```
   */
  async signIn(request: Request, options?: SignInOptions) {
    return await signIn(request, this.oauthConfig, options);
  }

  /**
   * Handles the OAuth callback request for the given OAuth configuration, and
   * then redirects the client to the success URL set in {@linkcode signIn}. The
   * request URL must match the redirect URL of the OAuth application.
   *
   * @example
   * ```ts
   * import {
   *   Client,
   *   createGitHubOAuthConfig
   * } from "https://deno.land/x/deno_kv_oauth@$VERSION/mod.ts";
   *
   * const kvOAuthClient = new Client(createGitHubOAuthConfig());
   *
   * export async function handleOAuthCallback(request: Request) {
   *   const { response, tokens, sessionId } = await kvOAuthClient.
   *     handleCallback(request);
   *
   *    // Perform some actions with the `tokens` and `sessionId`.
   *
   *    return response;
   * }
   * ```
   */
  async handleCallback(request: Request) {
    return await handleCallback(request, this.oauthConfig, {
      cookieOptions: this.options?.cookieOptions,
    });
  }

  /**
   * Handles the sign-out process, and then redirects the client to the given
   * success URL.
   *
   * @see {@link https://deno.land/x/deno_kv_oauth#redirects-after-sign-in-and-sign-out}
   *
   * @example
   * ```ts
   * import {
   *   Client,
   *   createGitHubOAuthConfig
   * } from "https://deno.land/x/deno_kv_oauth@$VERSION/mod.ts";
   *
   * const kvOAuthClient = new Client(createGitHubOAuthConfig());
   *
   * export async function signOutHandler(request: Request) {
   *   return kvOAuthClient.signOut(request);
   * }
   * ```
   */
  async signOut(request: Request) {
    return await signOut(request, {
      cookieOptions: this.options?.cookieOptions,
    });
  }

  /**
   * Gets the session ID from the cookie header of a request. This can be used to
   * check whether the client is signed-in by checking if the return value is
   * defined.
   *
   * @example
   * ```ts
   * import {
   *   Client,
   *   createGitHubOAuthConfig
   * } from "https://deno.land/x/deno_kv_oauth@$VERSION/mod.ts";
   *
   * const kvOAuthClient = new Client(createGitHubOAuthConfig());
   *
   * export function handler(request: Request) {
   *   const sessionId = kvOAuthClient.getSessionId(request);
   *   const hasSessionIdCookie = sessionId !== undefined;
   *
   *   return Response.json({ sessionId, hasSessionIdCookie });
   * }
   * ```
   */
  getSessionId(request: Request) {
    return getSessionId(request, {
      cookieName: this.options?.cookieOptions?.name,
    });
  }
}
