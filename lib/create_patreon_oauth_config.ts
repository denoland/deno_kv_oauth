// Copyright 2023-2024 the Deno authors. All rights reserved. MIT license.
import type { OAuth2ClientConfig } from "https://deno.land/x/oauth2_client@v1.0.2/mod.ts";
import { getRequiredEnv } from "./get_required_env.ts";

/**
 * Returns the OAuth configuration for Patreon.
 *
 * Requires `--allow-env[=PATREON_CLIENT_ID,PATREON_CLIENT_SECRET]` permissions
 * and environment variables:
 * 1. `PATREON_CLIENT_ID`
 * 2. `PATREON_CLIENT_SECRET`
 *
 * @example
 * ```ts
 * import { createPatreonOAuthConfig } from "https://deno.land/x/deno_kv_oauth/mod.ts";
 *
 * const oauthConfig = createPatreonOAuthConfig({
 *   redirectUri: "http://localhost:8000/callback",
 *   scope: "identity identity[email]"
 * });
 * ```
 *
 * @see {@link https://www.patreon.com/portal/registration/register-clients}
 */
export function createPatreonOAuthConfig(
  config: {
    /** @see {@linkcode OAuth2ClientConfig.redirectUri} */
    redirectUri: string;
    /** @see {@linkcode OAuth2ClientConfig.defaults.scope} */
    scope: string | string[];
  },
): OAuth2ClientConfig {
  return {
    clientId: getRequiredEnv("PATREON_CLIENT_ID"),
    clientSecret: getRequiredEnv("PATREON_CLIENT_SECRET"),
    authorizationEndpointUri: "https://www.patreon.com/oauth2/authorize",
    tokenUri: "https://www.patreon.com/api/oauth2/token",
    redirectUri: config.redirectUri,
    defaults: { scope: config.scope },
  };
}
