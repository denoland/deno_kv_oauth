// Copyright 2023 the Deno authors. All rights reserved. MIT license.

import type { OAuth2ClientConfig } from "../../deps.ts";
import { getRequiredEnv } from "./get_required_env.ts";

/**
 * Returns the OAuth configuration for Patreon.
 *
 * Requires `--allow-env[=PATREON_CLIENT_ID,PATREON_CLIENT_SECRET]` permissions and environment variables:
 * 1. `PATREON_CLIENT_ID`
 * 2. `PATREON_CLIENT_SECRET`
 *
 * @param redirectUri The URI of the client's redirection endpoint (sometimes also called callback URI).
 * @param scope Scopes to request.
 *
 * @example
 * ```ts
 * import { createPatreonOAuthConfig } from "https://deno.land/x/deno_kv_oauth@$VERSION/mod.ts";
 *
 * const oauthConfig = createPatreonOAuthConfig("http://localhost:8000/callback", "identity identity[email]");
 * ```
 *
 * @see {@link https://www.patreon.com/portal/registration/register-clients}
 */
export function createPatreonOAuthConfig(
  redirectUri: string,
  scope: string | string[],
): OAuth2ClientConfig {
  return {
    clientId: getRequiredEnv("PATREON_CLIENT_ID"),
    clientSecret: getRequiredEnv("PATREON_CLIENT_SECRET"),
    authorizationEndpointUri: "https://www.patreon.com/oauth2/authorize",
    tokenUri: "https://www.patreon.com/api/oauth2/token",
    redirectUri,
    defaults: { scope },
  };
}
