// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import type { OAuthUserConfig } from "../types.ts";
import { createOAuthConfig } from "./create.ts";

/**
 * Create a configuration for Google as the auth provider
 *
 * Requires `--allow-env[=GOOGLE_CLIENT_ID,GOOGLE_CLIENT_SECRET]` permissions and environment variables:
 * 1. `GOOGLE_CLIENT_ID`
 * 2. `GOOGLE_CLIENT_SECRET`
 *
 * @example
 * ```ts
 * import { createGoogleOAuthConfig } from "https://deno.land/x/deno_kv_oauth@$VERSION/src/config/google.ts";
 *
 * const oauthConfig = createGoogleOAuthConfig({
 *  redirectUri: "http://localhost:8000/callback",
 *  scope: "https://www.googleapis.com/auth/userinfo.profile"
 * });
 * ```
 *
 * @param config Requires `redirectUri` and `scope` properties
 *
 * @see {@link https://developers.google.com/identity/protocols/oauth2/web-server}
 */
export function createGoogleOAuthConfig(config: OAuthUserConfig) {
  return createOAuthConfig({
    name: "Google",
    authorizationEndpointUri: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUri: "https://oauth2.googleapis.com/token",
  }, config);
}

export default createGoogleOAuthConfig;
