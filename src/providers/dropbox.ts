// Copyright 2023 the Deno authors. All rights reserved. MIT license.

import type { OAuth2ClientConfig } from "../../deps.ts";
import { getRequiredEnv } from "./get_required_env.ts";

/**
 * Returns the OAuth configuration for Dropbox.
 *
 * Requires `--allow-env[=DROPBOX_CLIENT_ID,DROPBOX_CLIENT_SECRET]` permissions and environment variables:
 * 1. `DROPBOX_CLIENT_ID`
 * 2. `DROPBOX_CLIENT_SECRET`
 *
 * @param redirectUri The URI of the client's redirection endpoint (sometimes also called callback URI).
 * @param scope Default scopes to request unless otherwise specified.
 *
 * @example
 * ```ts
 * import { createDropboxOAuthConfig } from "https://deno.land/x/deno_kv_oauth@$VERSION/mod.ts";
 *
 * const oauthConfig = createDropboxOAuthConfig("http://localhost:8000/callback");
 * ```
 *
 * @see {@link https://developers.dropbox.com/oauth-guide}
 */
export function createDropboxOAuthConfig(
  redirectUri: string,
  scope?: string | string[],
): OAuth2ClientConfig {
  return {
    clientId: getRequiredEnv("DROPBOX_CLIENT_ID"),
    clientSecret: getRequiredEnv("DROPBOX_CLIENT_SECRET"),
    authorizationEndpointUri: "https://www.dropbox.com/oauth2/authorize",
    tokenUri: "https://api.dropboxapi.com/oauth2/token",
    redirectUri,
    defaults: { scope },
  };
}
