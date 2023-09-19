// Copyright 2023 the Deno authors. All rights reserved. MIT license.

import { OAuth2Client, OAuth2ClientConfig } from "../../deps.ts";
import type { WithRedirectUri, WithScope } from "./types.ts";

/**
 * Creates an OAuth 2.0 client with Okta as the provider.
 *
 * Requires `--allow-env[=OKTA_CLIENT_ID,OKTA_CLIENT_SECRET,OKTA_DOMAIN]` permissions and environment variables:
 * 1. `OKTA_CLIENT_ID`
 * 2. `OKTA_CLIENT_SECRET`
 * 3. `OKTA_DOMAIN`
 *
 * @param additionalOAuth2ClientConfig Requires `redirectUri` and `defaults.scope` properties.
 *
 * @example
 * ```ts
 * import { createOktaOAuth2Client } from "https://deno.land/x/deno_kv_oauth@$VERSION/mod.ts";
 *
 * const oauth2Client = createOktaOAuth2Client({
 *  redirectUri: "http://localhost:8000/callback",
 *  defaults: {
 *    scope: "openid"
 *  }
 * });
 * ```
 *
 * @see {@link https://developer.okta.com/docs/reference/api/oidc}
 */
export function createOktaOAuth2Client(
  additionalOAuth2ClientConfig:
    & Partial<OAuth2ClientConfig>
    & WithRedirectUri
    & WithScope,
): OAuth2Client {
  const domain = Deno.env.get("OKTA_DOMAIN");
  const baseURL = `https://${domain}/oauth2`;

  return new OAuth2Client({
    clientId: Deno.env.get("OKTA_CLIENT_ID")!,
    clientSecret: Deno.env.get("OKTA_CLIENT_SECRET")!,
    authorizationEndpointUri: `${baseURL}/v1/authorize`,
    tokenUri: `${baseURL}/v1/token`,
    ...additionalOAuth2ClientConfig,
  });
}
