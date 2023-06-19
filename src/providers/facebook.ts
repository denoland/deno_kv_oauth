// Copyright 2023 the Deno authors. All rights reserved. MIT license.

import { OAuth2Client, OAuth2ClientConfig } from "../../deps.ts";
import type { WithRedirectUri, WithScope } from "./_types.ts";

/**
 * Creates an OAuth 2.0 client with Facebook as the provider.
 *
 * Requires `--allow-env[=FACEBOOK_CLIENT_ID,FACEBOOK_CLIENT_SECRET]` permissions and environment variables:
 * 1. `FACEBOOK_CLIENT_ID`
 * 2. `FACEBOOK_CLIENT_SECRET`
 *
 * @param additionalOAuth2ClientConfig Requires `redirectUri` and `defaults.scope` properties.
 *
 * @example
 * ```ts
 * import { createFacebookOAuth2Client } from "https://deno.land/x/deno_kv_oauth@$VERSION/mod.ts";
 *
 * const oauth2Client = createFacebookOAuth2Client({
 *   redirectUri: "http://localhost:8000/callback",
 *   defaults: {
 *    scope: "email"
 *   }
 * });
 * ```
 *
 * @see {@link https://developers.facebook.com/docs/facebook-login/guides/advanced/manual-flow}
 */
export function createFacebookOAuth2Client(
  additionalOAuth2ClientConfig:
    & Partial<OAuth2ClientConfig>
    & WithScope
    & WithRedirectUri,
): OAuth2Client {
  return new OAuth2Client({
    clientId: Deno.env.get("FACEBOOK_CLIENT_ID")!,
    clientSecret: Deno.env.get("FACEBOOK_CLIENT_SECRET")!,
    authorizationEndpointUri: "https://www.facebook.com/v17.0/dialog/oauth",
    tokenUri: "https://graph.facebook.com/v17.0/oauth/access_token",
    ...additionalOAuth2ClientConfig,
  });
}
