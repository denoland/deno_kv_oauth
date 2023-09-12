// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import type { OAuthUserConfig } from "../types.ts";
import { createOAuthConfig } from "../config.ts";

/**
 * Create a configuration for Slack as the auth provider
 *
 * Requires `--allow-env[=SLACK_CLIENT_ID,SLACK_CLIENT_SECRET]` permissions and environment variables:
 * 1. `SLACK_CLIENT_ID`
 * 2. `SLACK_CLIENT_SECRET`
 *
 * @example
 * ```ts
 * import { createSlackOAuthConfig } from "https://deno.land/x/deno_kv_oauth@$VERSION/src/providers/slack.ts";
 *
 * const oauthConfig = createSlackOAuthConfig({
 *  redirectUri: "http://localhost:8000/callback",
 * });
 * ```
 *
 * @param config Requires `redirectUri`
 *
 * @see {@link https://api.slack.com/authentication/oauth-v2}
 */
export function createSlackOAuthConfig(config: OAuthUserConfig) {
  return createOAuthConfig({
    name: "Slack",
    authorizationEndpointUri: "https://slack.com/oauth/v2/authorize",
    tokenUri: "https://slack.com/api/oauth.v2.access",
    scope: ["openid", "email"],
  }, config);
}

export default createSlackOAuthConfig;
