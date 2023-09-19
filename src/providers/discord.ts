// Copyright 2023 the Deno authors. All rights reserved. MIT license.

import type { OAuth2ClientConfig } from "../../deps.ts";
import { getRequiredEnv } from "./get_required_env.ts";

/**
 * Returns the OAuth configuration for Discord.
 *
 * Requires `--allow-env[=DISCORD_CLIENT_ID,DISCORD_CLIENT_SECRET]` permissions and environment variables:
 * 1. `DISCORD_CLIENT_ID`
 * 2. `DISCORD_CLIENT_SECRET`
 *
 * @param redirectUri The URI of the client's redirection endpoint (sometimes also called callback URI).
 * @param scope Default scopes to request unless otherwise specified.
 *
 * @example
 * ```ts
 * import { createDiscordOAuthConfig } from "https://deno.land/x/deno_kv_oauth@$VERSION/mod.ts";
 *
 * const oauthConfig = createDiscordOAuthConfig("http://localhost:8000/callback", "identify");
 * ```
 *
 * @see {@link https://discord.com/developers/docs/topics/oauth2}
 */
export function createDiscordOAuthConfig(
  redirectUri: string,
  scope: string | string[],
): OAuth2ClientConfig {
  return {
    clientId: getRequiredEnv("DISCORD_CLIENT_ID"),
    clientSecret: getRequiredEnv("DISCORD_CLIENT_SECRET"),
    authorizationEndpointUri: "https://discord.com/oauth2/authorize",
    tokenUri: "https://discord.com/api/oauth2/token",
    redirectUri,
    defaults: { scope },
  };
}
