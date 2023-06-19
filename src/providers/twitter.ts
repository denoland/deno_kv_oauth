// Copyright 2023 the Deno authors. All rights reserved. MIT license.

import { OAuth2Client, OAuth2ClientConfig } from "../../deps.ts";
import type { WithRedirectUri, WithScope } from "./_types.ts";

/**
 * Creates an OAuth 2.0 client with Twitter as the provider.
 *
 * Requires `--allow-env[=TWITTER_CLIENT_ID,TWITTER_CLIENT_SECRET]` permissions and environment variables:
 * 1. `TWITTER_CLIENT_ID`
 * 2. `TWITTER_CLIENT_SECRET`
 *
 * @param additionalOAuth2ClientConfig Requires `redirectUri` and `defaults.scope` properties.
 *
 * @example
 * ```ts
 * import { createTwitterOAuth2Client } from "https://deno.land/x/deno_kv_oauth@$VERSION/mod.ts";
 *
 * const oauth2Client = createTwitterOAuth2Client({
 *  redirectUri: "http://localhost:8000/callback",
 *  defaults: {
 *    scope: "users.read"
 *  }
 * });
 * ```
 *
 * @see {@link https://github.com/twitterdev/twitter-api-typescript-sdk}
 */
export function createTwitterOAuth2Client(
  additionalOAuth2ClientConfig:
    & Partial<OAuth2ClientConfig>
    & WithRedirectUri
    & WithScope,
): OAuth2Client {
  return new OAuth2Client({
    clientId: Deno.env.get("TWITTER_CLIENT_ID")!,
    clientSecret: Deno.env.get("TWITTER_CLIENT_SECRET")!,
    authorizationEndpointUri: "https://twitter.com/i/oauth2/authorize",
    tokenUri: "https://api.twitter.com/2/oauth2/token",
    ...additionalOAuth2ClientConfig,
  });
}
