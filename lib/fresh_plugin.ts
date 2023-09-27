// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import type { Plugin } from "$fresh/server.ts";
import type { OAuth2ClientConfig } from "../deps.ts";
import { signIn } from "./sign_in.ts";
import { handleCallback } from "./handle_callback.ts";
import { signOut } from "./sign_out.ts";

export interface KvOAuthPluginOptions {
  /**
   * Sign-in page path
   *
   * @default {"/oauth/signin"}
   */
  signInPath?: string;
  /**
   * Callback page path
   *
   * @default {"/oauth/callback"}
   */
  callbackPath?: string;
  /**
   * Sign-out page path
   *
   * @default {"/oauth/signout"}
   */
  signOutPath?: string;
}

/**
 * Creates a basic plugin for the [Fresh]{@link https://fresh.deno.dev/} web framework.
 *
 * This creates handlers for the following routes:
 * - `GET /oauth/signin` for the sign-in page
 * - `GET /oauth/callback` for the callback page
 * - `GET /oauth/signout` for the sign-out page
 *
 * ```ts
 * // main.ts
 * import { start } from "$fresh/server.ts";
 * import { createGitHubOAuthConfig, kvOAuthPlugin } from "https://deno.land/x/deno_kv_oauth@$VERSION/mod.ts";
 * import manifest from "./fresh.gen.ts";
 *
 * await start(manifest, {
 *   plugins: [
 *     kvOAuthPlugin(createGitHubOAuthConfig())
 *   ]
 * });
 * ```
 */
export function kvOAuthPlugin(
  oauthConfig: OAuth2ClientConfig,
  options?: KvOAuthPluginOptions,
): Plugin {
  return {
    name: "kv-oauth",
    routes: [
      {
        path: options?.signInPath ?? "/oauth/signin",
        handler: async (req) => await signIn(req, oauthConfig),
      },
      {
        path: options?.callbackPath ?? "/oauth/callback",
        handler: async (req) => {
          // Return object also includes `tokens` and `sessionId` properties.
          const { response } = await handleCallback(req, oauthConfig);
          return response;
        },
      },
      {
        path: options?.signOutPath ?? "/oauth/signout",
        handler: async (request) => await signOut(request),
      },
    ],
  };
}
