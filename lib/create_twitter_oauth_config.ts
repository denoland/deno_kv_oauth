// Copyright 2023-2024 the Deno authors. All rights reserved. MIT license.
import type { OAuth2ClientConfig } from "https://deno.land/x/oauth2_client@v1.0.2/mod.ts";
import { getRequiredEnv } from "./get_required_env.ts";

/**
 * Returns the OAuth configuration for Twitter.
 *
 * Requires `--allow-env[=TWITTER_CLIENT_ID,TWITTER_CLIENT_SECRET]` permissions
 * and environment variables:
 * 1. `TWITTER_CLIENT_ID`
 * 2. `TWITTER_CLIENT_SECRET`
 *
 * @example Usage
 * ```ts
 * import { createTwitterOAuthConfig } from "jsr:@deno/kv-oauth";
 *
 * const oauthConfig = createTwitterOAuthConfig({
 *   redirectUri: "http://localhost:8000/callback",
 *   scope: "users.read",
 * });
 * ```
 *
 * @see {@link https://github.com/twitterdev/twitter-api-typescript-sdk}
 */
export function createTwitterOAuthConfig(
  config: {
    /** @see {@linkcode OAuth2ClientConfig.redirectUri} */
    redirectUri: string;
    /** @see {@linkcode OAuth2ClientConfig.defaults.scope} */
    scope: string | string[];
  },
): OAuth2ClientConfig {
  return {
    clientId: getRequiredEnv("TWITTER_CLIENT_ID"),
    clientSecret: getRequiredEnv("TWITTER_CLIENT_SECRET"),
    authorizationEndpointUri: "https://twitter.com/i/oauth2/authorize",
    tokenUri: "https://api.twitter.com/2/oauth2/token",
    redirectUri: config.redirectUri,
    defaults: { scope: config.scope },
  };
}
