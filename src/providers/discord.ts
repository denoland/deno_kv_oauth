// Copyright 2023 the Deno authors. All rights reserved. MIT license.

import { OAuth2Client, OAuth2ClientConfig } from "../../deps.ts";
import type { WithRedirectUri, WithScope } from "./_types.ts";

/**
 * Creates an OAuth 2.0 client with Discord as the provider.
 *
 * Requires `--allow-env[=DISCORD_CLIENT_ID,DISCORD_CLIENT_SECRET]` permissions and environment variables:
 * 1. `DISCORD_CLIENT_ID`
 * 2. `DISCORD_CLIENT_SECRET`
 *
 * @param additionalOAuth2ClientConfig Requires `redirectUri` and `defaults.scope` properties.
 *
 * @example
 * ```ts
 * import { createDiscordOAuth2Client } from "https://deno.land/x/deno_kv_oauth@$VERSION/mod.ts";
 *
 * const oauth2Client = createDiscordOAuth2Client({
 *  redirectUri: "http://localhost:8000/callback",
 *  defaults: {
 *    scope: "identify"
 *  }
 * });
 * ```
 *
 * @see {@link https://discord.com/developers/docs/topics/oauth2}
 */
export function createDiscordOAuth2Client(
  additionalOAuth2ClientConfig:
    & Partial<OAuth2ClientConfig>
    & WithScope
    & WithRedirectUri,
): OAuth2Client {
  return new OAuth2Client({
    clientId: Deno.env.get("DISCORD_CLIENT_ID")!,
    clientSecret: Deno.env.get("DISCORD_CLIENT_SECRET")!,
    authorizationEndpointUri: "https://discord.com/oauth2/authorize",
    tokenUri: "https://discord.com/api/oauth2/token",
    ...additionalOAuth2ClientConfig,
  });
}
