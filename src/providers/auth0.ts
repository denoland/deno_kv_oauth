// Copyright 2023 the Deno authors. All rights reserved. MIT license.

import { OAuth2Client, OAuth2ClientConfig } from "../../deps.ts";
import type { WithRedirectUri, WithScope } from "./_types.ts";

/**
 * Creates an OAuth 2.0 client with Auth0 as the provider.
 *
 * Requires `--allow-env[=AUTH0_CLIENT_ID,AUTH0_CLIENT_SECRET,AUTH0_DOMAIN]` permissions and environment variables:
 * 1. `AUTH0_CLIENT_ID`
 * 2. `AUTH0_CLIENT_SECRET`
 * 3. `AUTH0_DOMAIN`
 *
 * @param additionalOAuth2ClientConfig Requires `redirectUri` and `defaults.scope` properties.
 *
 * @example
 * ```ts
 * import { createAuth0OAuth2Client } from "https://deno.land/x/deno_kv_oauth@$VERSION/mod.ts";
 *
 * const oauth2Client = createAuth0OAuth2Client({
 *  redirectUri: "http://localhost:8000/callback",
 *  defaults: {
 *    scope: "openid"
 *  }
 * });
 * ```
 *
 * @see {@link https://auth0.com/docs/authenticate/protocols/oauth}
 */

export function createAuth0OAuth2Client(
  additionalOAuth2ClientConfig:
    & Partial<OAuth2ClientConfig>
    & WithRedirectUri
    & WithScope,
): OAuth2Client {
  const domain = Deno.env.get("AUTH0_DOMAIN");
  const baseURL = `https://${domain}/oauth2`;

  return new OAuth2Client({
    clientId: Deno.env.get("AUTH0_CLIENT_ID")!,
    clientSecret: Deno.env.get("AUTH0_CLIENT_SECRET")!,
    authorizationEndpointUri: `${baseURL}/authorize`,
    tokenUri: `${baseURL}/oauth/token`,
    ...additionalOAuth2ClientConfig,
  });
}
