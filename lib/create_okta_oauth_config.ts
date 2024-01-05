// Copyright 2023-2024 the Deno authors. All rights reserved. MIT license.
import type { OAuth2ClientConfig } from "../deps.ts";
import { getRequiredEnv } from "./get_required_env.ts";

/**
 * Returns the OAuth configuration for Okta.
 *
 * Requires `--allow-env[=OKTA_CLIENT_ID,OKTA_CLIENT_SECRET,OKTA_DOMAIN]`
 * permissions and environment variables:
 * 1. `OKTA_CLIENT_ID`
 * 2. `OKTA_CLIENT_SECRET`
 * 3. `OKTA_DOMAIN`
 *
 * @example
 * ```ts
 * import { createOktaOAuthConfig } from "https://deno.land/x/deno_kv_oauth@$VERSION/mod.ts";
 *
 * const oauthConfig = createOktaOAuthConfig({
 *   redirectUri: "http://localhost:8000/callback",
 *   scope: "openid",
 * });
 * ```
 *
 * @see {@link https://developer.okta.com/docs/reference/api/oidc}
 */
export function createOktaOAuthConfig(
  config: {
    /** @see {@linkcode OAuth2ClientConfig.redirectUri} */
    redirectUri: string;
    /** @see {@linkcode OAuth2ClientConfig.defaults.scope} */
    scope: string | string[];
  },
): OAuth2ClientConfig {
  const domain = getRequiredEnv("OKTA_DOMAIN");
  const baseURL = `https://${domain}/oauth2`;
  return {
    clientId: getRequiredEnv("OKTA_CLIENT_ID"),
    clientSecret: getRequiredEnv("OKTA_CLIENT_SECRET"),
    authorizationEndpointUri: `${baseURL}/v1/authorize`,
    tokenUri: `${baseURL}/v1/token`,
    redirectUri: config.redirectUri,
    defaults: { scope: config.scope },
  };
}
