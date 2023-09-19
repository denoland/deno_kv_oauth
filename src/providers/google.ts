// Copyright 2023 the Deno authors. All rights reserved. MIT license.

import type { OAuth2ClientConfig } from "../../deps.ts";
import { getRequiredEnv } from "./get_required_env.ts";

/**
 * Returns the OAuth configuration for Google.
 *
 * Requires `--allow-env[=GOOGLE_CLIENT_ID,GOOGLE_CLIENT_SECRET]` permissions and environment variables:
 * 1. `GOOGLE_CLIENT_ID`
 * 2. `GOOGLE_CLIENT_SECRET`
 *
 * @param redirectUri The URI of the client's redirection endpoint (sometimes also called callback URI).
 * @param scope Default scopes to request unless otherwise specified.
 *
 * @example
 * ```ts
 * import { createGoogleOAuthConfig } from "https://deno.land/x/deno_kv_oauth@$VERSION/mod.ts";
 *
 * const oauthConfig = createGoogleOAuthConfig("http://localhost:8000/callback", "https://www.googleapis.com/auth/userinfo.profile");
 * ```
 *
 * @see {@link https://developers.google.com/identity/protocols/oauth2/web-server}
 */
export function createGoogleOAuthConfig(
  redirectUri: string,
  scope: string | string[],
): OAuth2ClientConfig {
  return {
    clientId: getRequiredEnv("GOOGLE_CLIENT_ID"),
    clientSecret: getRequiredEnv("GOOGLE_CLIENT_SECRET"),
    authorizationEndpointUri: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUri: "https://oauth2.googleapis.com/token",
    redirectUri,
    defaults: { scope },
  };
}
