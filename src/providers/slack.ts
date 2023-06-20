// Copyright 2023 the Deno authors. All rights reserved. MIT license.

import { OAuth2Client, OAuth2ClientConfig } from "../../deps.ts";
import type { WithScope } from "./_types.ts";

/**
 * Creates an OAuth 2.0 client with Slack as the provider.
 *
 * Requires `--allow-env[=SLACK_CLIENT_ID,SLACK_CLIENT_SECRET]` permissions and environment variables:
 * 1. `SLACK_CLIENT_ID`
 * 2. `SLACK_CLIENT_SECRET`
 *
 * @param additionalOAuth2ClientConfig Requires `defaults.scope` property.
 *
 * @example
 * ```ts
 * import { createSlackOAuth2Client } from "https://deno.land/x/deno_kv_oauth@$VERSION/mod.ts";
 *
 * const oauth2Client = createSlackOAuth2Client({
 *  redirectUri: "http://localhost:8000/callback",
 *  defaults: {
 *    scope: "users.profile:read"
 *  }
 * });
 * ```
 *
 * @see {@link https://api.slack.com/authentication/oauth-v2}
 */
export function createSlackOAuth2Client(
  additionalOAuth2ClientConfig: Partial<OAuth2ClientConfig> & WithScope,
): OAuth2Client {
  return new OAuth2Client({
    clientId: Deno.env.get("SLACK_CLIENT_ID")!,
    clientSecret: Deno.env.get("SLACK_CLIENT_SECRET")!,
    authorizationEndpointUri: "https://slack.com/oauth/v2/authorize",
    tokenUri: "https://slack.com/api/oauth.v2.access",
    ...additionalOAuth2ClientConfig,
  });
}
