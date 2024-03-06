// Copyright 2023-2024 the Deno authors. All rights reserved. MIT license.
import type { OAuth2ClientConfig } from "../deps.ts";
import { getRequiredEnv } from "./get_required_env.ts";

/**
 * Returns the OAuth configuration for an Amazon Cognito user pool.
 *
 * Requires `--allow-env[=COGNITO_USER_POOL_CLIENT_ID,COGNITO_USER_POOL_CLIENT_SECRET,COGNITO_USER_POOL_DOMAIN]`
 * permissions and environment variables:
 * 1. `COGNITO_USER_POOL_CLIENT_ID`
 * 2. `COGNITO_USER_POOL_CLIENT_SECRET`
 * 3. `COGNITO_USER_POOL_DOMAIN`
 *
 * @example
 * ```ts
 * import { createCognitoUserPoolOAuthConfig } from "https://deno.land/x/deno_kv_oauth/mod.ts";
 *
 * const oauthConfig = createCognitoUserPoolOAuthConfig({
 *   redirectUri: "http://localhost:8000/callback",
 *   scope: "openid"
 * });
 * ```
 *
 * @see {@link https://docs.aws.amazon.com/cognito/latest/developerguide/federation-endpoints-oauth-grants.html}
 */

export function createCognitoUserPoolOAuthConfig(
  config: {
    /** @see {@linkcode OAuth2ClientConfig.redirectUri} */
    redirectUri: string;
    /** @see {@linkcode OAuth2ClientConfig.defaults.scope} */
    scope?: string | string[];
  },
): OAuth2ClientConfig {
  const domain = getRequiredEnv("COGNITO_USER_POOL_DOMAIN");
  const baseURL = `https://${domain}/oauth2`;
  return {
    clientId: getRequiredEnv("COGNITO_USER_POOL_CLIENT_ID"),
    clientSecret: getRequiredEnv("COGNITO_USER_POOL_CLIENT_SECRET"),
    authorizationEndpointUri: `${baseURL}/authorize`,
    tokenUri: `${baseURL}/token`,
    redirectUri: config.redirectUri,
    defaults: { scope: config?.scope },
  };
}
