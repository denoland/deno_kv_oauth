// Copyright 2023 the Deno authors. All rights reserved. MIT license.

import { OAuth2Client, OAuth2ClientConfig } from "../../deps.ts";
import type { WithRedirectUri, WithScope } from "./types.ts";

/**
 * Creates an OAuth 2.0 client with Google as the provider.
 *
 * Requires `--allow-env[=GOOGLE_CLIENT_ID,GOOGLE_CLIENT_SECRET]` permissions and environment variables:
 * 1. `GOOGLE_CLIENT_ID`
 * 2. `GOOGLE_CLIENT_SECRET`
 *
 * @param additionalOAuth2ClientConfig Requires `redirectUri` and `defaults.scope` properties.
 *
 * @example
 * ```ts
 * import { createGoogleOAuth2Client } from "https://deno.land/x/deno_kv_oauth@$VERSION/mod.ts";
 *
 * const oauth2Client = createGoogleOAuth2Client({
 *  redirectUri: "http://localhost:8000/callback",
 *  defaults: {
 *    scope: "https://www.googleapis.com/auth/userinfo.profile"
 *  }
 * });
 * ```
 *
 * @see {@link https://developers.google.com/identity/protocols/oauth2/web-server}
 */
export function createGoogleOAuth2Client(
  additionalOAuth2ClientConfig:
    & Partial<OAuth2ClientConfig>
    & WithRedirectUri
    & WithScope,
): OAuth2Client {
  return new OAuth2Client({
    clientId: Deno.env.get("GOOGLE_CLIENT_ID")!,
    clientSecret: Deno.env.get("GOOGLE_CLIENT_SECRET")!,
    authorizationEndpointUri: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUri: "https://oauth2.googleapis.com/token",
    ...additionalOAuth2ClientConfig,
  });
}
