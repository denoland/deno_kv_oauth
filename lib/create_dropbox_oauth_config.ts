// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import type { OAuth2ClientConfig } from "../deps.ts";
import { getRequiredEnv } from "./get_required_env.ts";

/**
 * Returns the OAuth configuration for Dropbox.
 *
 * Requires `--allow-env[=DROPBOX_CLIENT_ID,DROPBOX_CLIENT_SECRET]` permissions
 * and environment variables:
 * 1. `DROPBOX_CLIENT_ID`
 * 2. `DROPBOX_CLIENT_SECRET`
 *
 * @example
 * ```ts
 * import { createDropboxOAuthConfig } from "https://deno.land/x/deno_kv_oauth@$VERSION/mod.ts";
 *
 * const oauthConfig = createDropboxOAuthConfig({
 *   redirectUri: "http://localhost:8000/callback"
 * });
 * ```
 *
 * @see {@link https://developers.dropbox.com/oauth-guide}
 */
export function createDropboxOAuthConfig(
  config: {
    /** @see {@linkcode OAuth2ClientConfig.redirectUri} */
    redirectUri: string;
    /** @see {@linkcode OAuth2ClientConfig.defaults.scope} */
    scope?: string | string[];
  },
): OAuth2ClientConfig {
  return {
    clientId: getRequiredEnv("DROPBOX_CLIENT_ID"),
    clientSecret: getRequiredEnv("DROPBOX_CLIENT_SECRET"),
    authorizationEndpointUri: "https://www.dropbox.com/oauth2/authorize",
    tokenUri: "https://api.dropboxapi.com/oauth2/token",
    redirectUri: config.redirectUri,
    defaults: { scope: config.scope },
  };
}
