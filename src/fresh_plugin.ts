// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import type { Plugin } from "$fresh/server.ts";
import { OAuth2Client } from "../deps.ts";
import { signIn } from "./sign_in.ts";
import { handleCallback } from "./handle_callback.ts";
import { signOut } from "./sign_out.ts";

interface KVOAuthPluginOptions {
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
 * import { createGitHubOAuth2Client } from "https://deno.land/x/deno_kv_oauth@$VERSION/mod.ts";
 * import { kvOAuthPlugin } from "https://deno.land/x/deno_kv_oauth@$VERSION/fresh.ts";
 * import manifest from "./fresh.gen.ts";
 *
 * await start(manifest, {
 *   plugins: [
 *     kvOAuthPlugin(createGitHubOAuth2Client())
 *   ]
 * });
 * ```
 */
export function kvOAuthPlugin(
  oauth2Client: OAuth2Client,
  options?: KVOAuthPluginOptions,
): Plugin;

/**
 * Creates a basic plugin for the [Fresh]{@link https://fresh.deno.dev/} web framework.
 *
 * This creates handlers for the following routes:
 * - `GET /oauth/{PROVIDER}/signin` for the sign-in page
 * - `GET /oauth/{PROVIDER}/callback` for the callback page
 * - `GET /oauth/{PROVIDER}/signout` for the sign-out page
 *
 * ```ts
 * // main.ts
 * import { start } from "$fresh/server.ts";
 * import { createGitHubOAuth2Client } from "https://deno.land/x/deno_kv_oauth@$VERSION/mod.ts";
 * import { kvOAuthPlugin } from "https://deno.land/x/deno_kv_oauth@$VERSION/fresh.ts";
 * import manifest from "./fresh.gen.ts";
 *
 * await start(manifest, {
 *   plugins: [
 *      kvOAuthPlugin({
 *          github: createGitHubOAuth2Client(),
 *      })
 *   ]
 * });
 * ```
 */
export function kvOAuthPlugin(providers: Record<string, OAuth2Client>): Plugin;

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
 * import { createGitHubOAuth2Client } from "https://deno.land/x/deno_kv_oauth@$VERSION/mod.ts";
 * import { kvOAuthPlugin } from "https://deno.land/x/deno_kv_oauth@$VERSION/fresh.ts";
 * import manifest from "./fresh.gen.ts";
 *
 * await start(manifest, {
 *   plugins: [
 *     kvOAuthPlugin(createGitHubOAuth2Client())
 *   ]
 * });
 * ```
 */
export function kvOAuthPlugin(
  ...args: [
    oauth2Client: OAuth2Client,
    options?: KVOAuthPluginOptions,
  ] | [
    providers: Record<string, OAuth2Client>,
  ]
): Plugin {
  const routes: Plugin["routes"] = [];

  if (args.length >= 3 || args.length <= 0) {
    throw new Error(
      `Unable to initialise kv-oauth plugin with. Expected 1-2 arguments, got ${args.length}.`,
    );
  }

  const firstArgIsOAuthClient = args[0] instanceof OAuth2Client;

  if (args.length === 1 && !firstArgIsOAuthClient) {
    const [providers] = args;
    Object.entries(providers).forEach(([providerName, oauth2Client]) =>
      routes.push(
        {
          path: `/oauth/${providerName}/signin`,
          handler: async (req) => await signIn(req, oauth2Client),
        },
        {
          path: `/oauth/${providerName}/callback`,
          handler: async (req) => {
            // Return object also includes `accessToken` and `sessionId` properties.
            const { response } = await handleCallback(
              req,
              oauth2Client,
            );
            return response;
          },
        },
        {
          path: `/oauth/${providerName}/signout`,
          handler: signOut,
        },
      )
    );
  }

  if (args.length === 2 || firstArgIsOAuthClient) {
    const [oauth2Client, options] = args;
    routes.push(
      {
        path: options?.signInPath ?? "/oauth/signin",
        handler: async (req) => await signIn(req, oauth2Client),
      },
      {
        path: options?.callbackPath ?? "/oauth/callback",
        handler: async (req) => {
          // Return object also includes `accessToken` and `sessionId` properties.
          const { response } = await handleCallback(
            req,
            oauth2Client,
          );
          return response;
        },
      },
      {
        path: options?.signOutPath ?? "/oauth/signout",
        handler: signOut,
      },
    );
  }

  return {
    name: "kv-oauth",
    routes,
  };
}
