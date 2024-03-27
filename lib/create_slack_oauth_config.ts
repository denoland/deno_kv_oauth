// Copyright 2023-2024 the Deno authors. All rights reserved. MIT license.
import type { OAuth2ClientConfig } from "https://deno.land/x/oauth2_client@v1.0.2/mod.ts";
import { getRequiredEnv } from "./get_required_env.ts";

/**
 * Returns the OAuth configuration for Slack.
 *
 * Requires `--allow-env[=SLACK_CLIENT_ID,SLACK_CLIENT_SECRET]` permissions and
 * environment variables:
 * 1. `SLACK_CLIENT_ID`
 * 2. `SLACK_CLIENT_SECRET`
 *
 * @example
 * ```ts
 * import { createSlackOAuthConfig } from "jsr:@deno/kv-oauth";
 *
 * const oauthConfig = createSlackOAuthConfig({
 *   scope: "users.profile:read",
 * });
 * ```
 *
 * @see {@link https://api.slack.com/authentication/oauth-v2}
 */
export function createSlackOAuthConfig(
  config: {
    /** @see {@linkcode OAuth2ClientConfig.redirectUri} */
    redirectUri?: string;
    /** @see {@linkcode OAuth2ClientConfig.defaults.scope} */
    scope: string | string[];
  },
): OAuth2ClientConfig {
  return {
    clientId: getRequiredEnv("SLACK_CLIENT_ID"),
    clientSecret: getRequiredEnv("SLACK_CLIENT_SECRET"),
    authorizationEndpointUri: "https://slack.com/oauth/v2/authorize",
    tokenUri: "https://slack.com/api/oauth.v2.access",
    redirectUri: config.redirectUri,
    defaults: { scope: config.scope },
  };
}
