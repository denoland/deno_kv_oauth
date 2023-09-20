// Copyright 2023 the Deno authors. All rights reserved. MIT license.

import type { OAuth2ClientConfig } from "../../deps.ts";
import { getRequiredEnv } from "./get_required_env.ts";

/**
 * Returns the OAuth configuration for Auth0.
 *
 * Requires `--allow-env[=AUTH0_CLIENT_ID,AUTH0_CLIENT_SECRET,AUTH0_DOMAIN]` permissions and environment variables:
 * 1. `AUTH0_CLIENT_ID`
 * 2. `AUTH0_CLIENT_SECRET`
 * 3. `AUTH0_DOMAIN`
 *
 * @param redirectUri The URI of the client's redirection endpoint (sometimes also called callback URI).
 * @param scope Scopes to request.
 *
 * @example
 * ```ts
 * import { createAuth0OAuthConfig } from "https://deno.land/x/deno_kv_oauth@$VERSION/mod.ts";
 *
 * const oauthConfig = createAuth0OAuthConfig("http://localhost:8000/callback", "openid");
 * ```
 *
 * @see {@link https://auth0.com/docs/authenticate/protocols/oauth}
 */

export function createAuth0OAuthConfig(
  redirectUri: string,
  scope: string | string[],
): OAuth2ClientConfig {
  const domain = getRequiredEnv("AUTH0_DOMAIN");
  const baseURL = `https://${domain}/oauth2`;
  return {
    clientId: getRequiredEnv("AUTH0_CLIENT_ID"),
    clientSecret: getRequiredEnv("AUTH0_CLIENT_SECRET"),
    authorizationEndpointUri: `${baseURL}/authorize`,
    tokenUri: `${baseURL}/oauth/token`,
    redirectUri,
    defaults: { scope },
  };
}
