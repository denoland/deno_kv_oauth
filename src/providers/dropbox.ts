// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import type { OAuthUserConfig } from "../types.ts";
import { createOAuthConfig } from "../config.ts";

/**
 * Create a configuration for Dropbox as the auth provider
 *
 * Requires `--allow-env[=DROPBOX_CLIENT_ID,DROPBOX_CLIENT_SECRET]` permissions and environment variables:
 * 1. `DROPBOX_CLIENT_ID`
 * 2. `DROPBOX_CLIENT_SECRET`
 *
 * @example
 * ```ts
 * import { createDropboxOAuthConfig } from "https://deno.land/x/deno_kv_oauth@$VERSION/src/providers/dropbox.ts";
 *
 * const oauthConfig = createDropboxOAuthConfig({
 *  redirectUri: "http://localhost:8000/callback"
 * });
 * ```
 *
 * @param config Requires `redirectUri`
 *
 * @see {@link https://developers.dropbox.com/oauth-guide}
 */
export function createDropboxOAuthConfig(config: OAuthUserConfig) {
  return createOAuthConfig({
    name: "Dropbox",
    authorizationEndpointUri: "https://www.dropbox.com/oauth2/authorize",
    tokenUri: "https://api.dropboxapi.com/oauth2/token",
    scope: [],
  }, config);
}

export default createDropboxOAuthConfig;
