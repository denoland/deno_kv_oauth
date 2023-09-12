// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import type { OAuthUserConfig } from "../types.ts";
import { createOAuthConfig } from "../config.ts";

/**
 * Create a configuration for Patreon as the auth provider
 *
 * Requires `--allow-env[=PATREON_CLIENT_ID,PATREON_CLIENT_SECRET]` permissions and environment variables:
 * 1. `PATREON_CLIENT_ID`
 * 2. `PATREON_CLIENT_SECRET`
 *
 * @example
 * ```ts
 * import { createPatreonOAuthConfig } from "https://deno.land/x/deno_kv_oauth@$VERSION/src/providers/patreon.ts";
 *
 * const oauthConfig = createPatreonOAuthConfig({
 *  redirectUri: "http://localhost:8000/callback",
 * });
 * ```
 *
 * @param config Requires `redirectUri`
 *
 * @see {@link https://www.patreon.com/portal/registration/register-clients}
 */
export function createPatreonOAuthConfig(config: OAuthUserConfig) {
  return createOAuthConfig({
    name: "Patreon",
    authorizationEndpointUri: "https://www.patreon.com/oauth2/authorize",
    tokenUri: "https://www.patreon.com/api/oauth2/token",
    scope: [],
  }, config);
}

export default createPatreonOAuthConfig;
