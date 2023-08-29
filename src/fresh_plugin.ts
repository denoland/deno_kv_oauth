// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import type { Plugin } from "$fresh/server.ts";
import { OAuth2Client } from "../deps.ts";
import { signIn } from "./sign_in.ts";
import { handleCallback } from "./handle_callback.ts";
import { signOut } from "./sign_out.ts";

/**
 * Creates a basic plugin for the [Fresh]{@link https://fresh.deno.dev/} web framework.
 *
 * This creates handlers for the following routes:
 * - `GET /oauth/signin` for the sign-in page
 * - `GET /oauth/callback` for the callback page
 * - `GET /oauth/signout` for the sign-out page
 *
 * ```ts
 * // utils/oauth2_client.ts
 * import { createGitHubOAuth2Client } from "https://deno.land/x/deno_kv_oauth@$VERSION/mod.ts";
 *
 * export const oauth2Client = createGitHubOAuth2Client();
 * ```
 *
 * ```ts
 * // main.ts
 * import { start } from "$fresh/server.ts";
 * import { kvOAuthPlugin } from "https://deno.land/x/deno_kv_oauth@$VERSION/mod.ts";
 * import manifest from "./fresh.gen.ts";
 * import { oauth2Client } from "./utils/oauth2_client.ts"
 *
 * await start(manifest, {
 *   plugins: [
 *     kvOAuthPlugin(oauth2Client)
 *   ]
 * });
 * ```
 */
export function kvOAuthPlugin(
  oauth2Client: OAuth2Client,
  options?: {
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
  },
): Plugin {
  return {
    name: "kv-oauth",
    routes: [
      {
        path: options?.signInPath ?? "/oauth/signin",
        handler: async (req) => await signIn(req, oauth2Client),
      },
      {
        path: options?.callbackPath ?? "/oauth/callback",
        handler: async (req) => {
          // Return object also includes `accessToken` and `sessionId` properties.
          const { response } = await handleCallback(req, oauth2Client);
          return response;
        },
      },
      {
        path: options?.signOutPath ?? "/oauth/signout",
        handler: async (req) => await signOut(req),
      },
    ],
  };
}
