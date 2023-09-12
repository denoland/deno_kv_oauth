// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import type { OAuthUserConfig } from "../types.ts";
import { createOAuthConfig } from "../config.ts";

/**
 * Create a configuration for Discord as the auth provider
 *
 * Requires `--allow-env[=DISCORD_CLIENT_ID,DISCORD_CLIENT_SECRET]` permissions and environment variables:
 * 1. `DISCORD_CLIENT_ID`
 * 2. `DISCORD_CLIENT_SECRET`
 *
 * @example
 * ```ts
 * import { createDiscordOAuthConfig } from "https://deno.land/x/deno_kv_oauth@$VERSION/src/providers/discord.ts";
 *
 * const oauthConfig = createDiscordOAuthConfig({
 *  redirectUri: "http://localhost:8000/callback"
 * });
 * ```
 *
 * @param config Requires `redirectUri`
 *
 * @see {@link https://discord.com/developers/docs/topics/oauth2}
 */
export function createDiscordOAuthConfig(config: OAuthUserConfig) {
  return createOAuthConfig({
    name: "Discord",
    authorizationEndpointUri: "https://discord.com/oauth2/authorize",
    tokenUri: "https://discord.com/api/oauth2/token",
    scope: ["email"],
  }, config);
}

export default createDiscordOAuthConfig;
