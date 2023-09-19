// Copyright 2023 the Deno authors. All rights reserved. MIT license.

import type { OAuth2ClientConfig } from "../../deps.ts";
import { getRequiredEnv } from "./get_required_env.ts";

/**
 * Returns the OAuth configuration for Facebook.
 *
 * Requires `--allow-env[=FACEBOOK_CLIENT_ID,FACEBOOK_CLIENT_SECRET]` permissions and environment variables:
 * 1. `FACEBOOK_CLIENT_ID`
 * 2. `FACEBOOK_CLIENT_SECRET`
 *
 * @param redirectUri The URI of the client's redirection endpoint (sometimes also called callback URI).
 * @param scope Default scopes to request unless otherwise specified.
 *
 * @example
 * ```ts
 * import { createFacebookOAuthConfig } from "https://deno.land/x/deno_kv_oauth@$VERSION/mod.ts";
 *
 * const oauthConfig = createFacebookOAuthConfig("http://localhost:8000/callback", "email");
 * ```
 *
 * @see {@link https://developers.facebook.com/docs/facebook-login/guides/advanced/manual-flow}
 */
export function createFacebookOAuthConfig(
  redirectUri: string,
  scope: string | string[],
): OAuth2ClientConfig {
  return {
    clientId: getRequiredEnv("FACEBOOK_CLIENT_ID"),
    clientSecret: getRequiredEnv("FACEBOOK_CLIENT_SECRET"),
    authorizationEndpointUri: "https://www.facebook.com/v17.0/dialog/oauth",
    tokenUri: "https://graph.facebook.com/v17.0/oauth/access_token",
    redirectUri,
    defaults: { scope },
  };
}
