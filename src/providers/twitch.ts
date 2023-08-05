// Copyright 2023 the Deno authors. All rights reserved. MIT license.

import { OAuth2Client, OAuth2ClientConfig } from "../../deps.ts";
import type { WithRedirectUri, WithScope } from "./_types.ts";

/**
 * Creates an OAuth 2.0 client with Twitch as the provider.
 *
 * Requires `--allow-env[=TWITCH_CLIENT_ID,TWITCH_CLIENT_SECRET]` permissions and environment variables:
 * 1. `TWITCH_CLIENT_ID`
 * 2. `TWITCH_CLIENT_SECRET`
 *
 * @param additionalOAuth2ClientConfig Requires `redirectUri` and `defaults.scope` properties.
 *
 * @example
 * ```ts
 * import { createTwitchOAuth2Client } from "https://deno.land/x/deno_kv_oauth@$VERSION/mod.ts";
 *
 * const oauth2Client = createTwitchOAuth2Client({
 *  redirectUri: "http://localhost:8000/callback",
 *  defaults: {
 *    scope: "moderator:read:followers"
 *  }
 * });
 * ```
 *
 * @see {@link https://dev.twitch.tv/docs/authentication/}
 */
export function createTwitchOAuth2Client(
  additionalOAuth2ClientConfig:
    & Partial<OAuth2ClientConfig>
    & WithRedirectUri
    & WithScope,
): OAuth2Client {
  const clientId = Deno.env.get("TWITCH_CLIENT_ID")!;
  const clientSecret = Deno.env.get("TWITCH_CLIENT_SECRET")!;

  return new OAuth2Client({
    clientId,
    clientSecret,
    authorizationEndpointUri: "https://id.twitch.tv/oauth2/authorize",
    tokenUri: "https://id.twitch.tv/oauth2/token",
    ...additionalOAuth2ClientConfig,
    defaults: {
      ...additionalOAuth2ClientConfig.defaults,
      requestOptions: {
        ...additionalOAuth2ClientConfig.defaults.requestOptions,
        urlParams: {
          ...additionalOAuth2ClientConfig.defaults.requestOptions?.urlParams,
          client_id: clientId,
          client_secret: clientSecret,
        },
      },
    },
  });
}
