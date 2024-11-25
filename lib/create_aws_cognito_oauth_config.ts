// Copyright 2023-2024 the Deno authors. All rights reserved. MIT license.
import type { OAuth2ClientConfig } from "@cmd-johnson/oauth2-client";
import { getRequiredEnv } from "./get_required_env.ts";

/**
 * Returns the OAuth configuration for an Amazon Cognito user pool.
 *
 * Requires `--allow-env[=AWS_COGNITO_CLIENT_ID,AWS_COGNITO_CLIENT_SECRET,AWS_COGNITO_DOMAIN]`
 * permissions and environment variables:
 * 1. `AWS_COGNITO_CLIENT_ID`
 * 2. `AWS_COGNITO_CLIENT_SECRET`
 * 3. `AWS_COGNITO_DOMAIN`
 *
 * @example Usage
 * ```ts ignore
 * import { createAwsCognitoOAuthConfig } from "jsr:@deno/kv-oauth";
 *
 * const oauthConfig = createAwsCognitoOAuthConfig({
 *   redirectUri: "http://localhost:8000/callback",
 *   scope: "openid"
 * });
 * ```
 *
 * @see {@link https://docs.aws.amazon.com/cognito/latest/developerguide/federation-endpoints-oauth-grants.html}
 */

export function createAwsCognitoOAuthConfig(
  config: {
    /** @see {@linkcode OAuth2ClientConfig.redirectUri} */
    redirectUri: string;
    /** @see {@linkcode OAuth2ClientConfig.defaults.scope} */
    scope?: string | string[];
  },
): OAuth2ClientConfig {
  const domain = getRequiredEnv("AWS_COGNITO_DOMAIN");
  const baseURL = `https://${domain}/oauth2`;
  return {
    clientId: getRequiredEnv("AWS_COGNITO_CLIENT_ID"),
    clientSecret: getRequiredEnv("AWS_COGNITO_CLIENT_SECRET"),
    authorizationEndpointUri: `${baseURL}/authorize`,
    tokenUri: `${baseURL}/token`,
    redirectUri: config.redirectUri,
    defaults: { scope: config?.scope },
  };
}
