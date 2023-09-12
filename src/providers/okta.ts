// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import type { OAuthUserConfig } from "../types.ts";
import { createOAuthConfig, fallbackToEnv } from "../config.ts";

/**
 * Create a configuration for Google as the auth provider
 *
 * Requires `--allow-env[=OKTA_CLIENT_ID,OKTA_CLIENT_SECRET,OKTA_DOMAIN]` permissions and environment variables:
 * 1. `OKTA_CLIENT_ID`
 * 2. `OKTA_CLIENT_SECRET`
 * 3. `OKTA_DOMAIN`
 *
 * @example
 * ```ts
 * import { createOktaOAuthConfig } from "https://deno.land/x/deno_kv_oauth@$VERSION/src/providers/okta.ts";
 *
 * const oauthConfig = createOktaOAuthConfig({
 *  redirectUri: "http://localhost:8000/callback"
 * });
 * ```
 *
 * @param config Requires `redirectUri`
 *
 * @see {@link https://developer.okta.com/docs/reference/api/oidc}
 */
export function createOktaOAuthConfig(config: OAuthUserConfig) {
  const domain = fallbackToEnv(config.domain, "OKTA_DOMAIN");
  const baseURL = `https://${domain}/oauth2`;

  return createOAuthConfig({
    name: "Okta",
    authorizationEndpointUri: `${baseURL}/v1/authorize`,
    tokenUri: `${baseURL}/v1/token`,
    scope: ["openid"],
  }, config);
}

export default createOktaOAuthConfig;
