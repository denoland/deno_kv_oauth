// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import type { OAuthUserConfig } from "../types.ts";
import { createOAuthConfig, fallbackToEnv } from "../config.ts";

/**
 * Create a configuration for Auth0 as the auth provider
 *
 * Requires `--allow-env[=AUTH0_CLIENT_ID,AUTH0_CLIENT_SECRET,AUTH0_DOMAIN]` permissions and environment variables:
 * 1. `AUTH0_CLIENT_ID`
 * 2. `AUTH0_CLIENT_SECRET`
 * 3. `AUTH0_DOMAIN`
 *
 * @example
 * ```ts
 * import { createAuth0OAuthConfig } from "https://deno.land/x/deno_kv_oauth@$VERSION/src/providers/auth0.ts";
 *
 * const oauthConfig = createAuth0OAuthConfig({
 *  redirectUri: "http://localhost:8000/callback"
 * });
 * ```
 *
 * @param config Requires `redirectUri`
 *
 * @see {@link https://auth0.com/docs/authenticate/protocols/oauth}
 */
export function createAuth0OAuthConfig(config: OAuthUserConfig) {
  const domain = fallbackToEnv(config.domain, "AUTH0_DOMAIN");
  const baseURL = `https://${domain}/oauth2`;

  return createOAuthConfig({
    name: "Auth0",
    authorizationEndpointUri: `${baseURL}/authorize`,
    tokenUri: `${baseURL}/oauth/token`,
    scope: ["openid"],
  }, config);
}

export default createAuth0OAuthConfig;
