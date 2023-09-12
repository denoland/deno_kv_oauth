// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import type { OAuthUserConfig } from "../types.ts";
import { createOAuthConfig } from "../config.ts";

/**
 * Create a configuration for Twitter as the auth provider
 *
 * Requires `--allow-env[=TWITTER_CLIENT_ID,TWITTER_CLIENT_SECRET]` permissions and environment variables:
 * 1. `TWITTER_CLIENT_ID`
 * 2. `TWITTER_CLIENT_SECRET`
 *
 * @example
 * ```ts
 * import { createTwitterOAuthConfig } from "https://deno.land/x/deno_kv_oauth@$VERSION/src/providers/twitter.ts";
 *
 * const oauthConfig = createTwitterOAuthConfig({
 *  redirectUri: "http://localhost:8000/callback",
 * });
 * ```
 *
 * @param config Requires `redirectUri`
 *
 * @see {@link https://developer.twitter.com/en/docs/authentication/oauth-2-0/authorization-code}
 */
export function createTwitterOAuthConfig(config: OAuthUserConfig) {
  return createOAuthConfig({
    name: "Twitter",
    authorizationEndpointUri: "https://twitter.com/i/oauth2/authorize",
    tokenUri: "https://api.twitter.com/2/oauth2/token",
    scope: [],
  }, config);
}

export default createTwitterOAuthConfig;
