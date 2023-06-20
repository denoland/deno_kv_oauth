// Copyright 2023 the Deno authors. All rights reserved. MIT license.

import { OAuth2Client, OAuth2ClientConfig } from "../../deps.ts";
import type { WithRedirectUri, WithScope } from "./_types.ts";

/**
 * Creates an OAuth 2.0 client with Patreon as the provider.
 *
 * Requires `--allow-env[=PATREON_CLIENT_ID,PATREON_CLIENT_SECRET]` permissions and environment variables:
 * 1. `PATREON_CLIENT_ID`
 * 2. `PATREON_CLIENT_SECRET`
 *
 * @param additionalOAuth2ClientConfig Requires `redirectUri` and `defaults.scope` properties.
 *
 * @example
 * ```ts
 * import { createPatreonOAuth2Client } from "https://deno.land/x/deno_kv_oauth@$VERSION/mod.ts";
 *
 * const oauth2Client = createPatreonOAuth2Client({
 *  redirectUri: "http://localhost:8000/callback",
 *  defaults: {
 *    scope: "identity identity[email]"
 *  }
 * });
 * ```
 *
 * @see {@link https://www.patreon.com/portal/registration/register-clients}
 */
export function createPatreonOAuth2Client(
  additionalOAuth2ClientConfig:
    & Partial<OAuth2ClientConfig>
    & WithRedirectUri
    & WithScope,
): OAuth2Client {
  return new OAuth2Client({
    clientId: Deno.env.get("PATREON_CLIENT_ID")!,
    clientSecret: Deno.env.get("PATREON_CLIENT_SECRET")!,
    authorizationEndpointUri: "https://www.patreon.com/oauth2/authorize",
    tokenUri: "https://www.patreon.com/api/oauth2/token",
    ...additionalOAuth2ClientConfig,
  });
}
