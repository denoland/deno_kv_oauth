// Copyright 2023 the Deno authors. All rights reserved. MIT license.

import { OAuth2Client, OAuth2ClientConfig } from "../../deps.ts";
import type { WithRedirectUri } from "./types.ts";

/**
 * Creates an OAuth 2.0 client with Dropbox as the provider.
 *
 * Requires `--allow-env[=DROPBOX_CLIENT_ID,DROPBOX_CLIENT_SECRET]` permissions and environment variables:
 * 1. `DROPBOX_CLIENT_ID`
 * 2. `DROPBOX_CLIENT_SECRET`
 *
 * @param additionalOAuth2ClientConfig Requires `redirectUri` property.
 *
 * @example
 * ```ts
 * import { createDropboxOAuth2Client } from "https://deno.land/x/deno_kv_oauth@$VERSION/mod.ts";
 *
 * const oauth2Client = createDropboxOAuth2Client({
 *   redirectUri: "http://localhost:8000/callback",
 * });
 * ```
 *
 * @see {@link https://developers.dropbox.com/oauth-guide}
 */
export function createDropboxOAuth2Client(
  additionalOAuth2ClientConfig:
    & Partial<OAuth2ClientConfig>
    & WithRedirectUri,
): OAuth2Client {
  return new OAuth2Client({
    clientId: Deno.env.get("DROPBOX_CLIENT_ID")!,
    clientSecret: Deno.env.get("DROPBOX_CLIENT_SECRET")!,
    authorizationEndpointUri: "https://www.dropbox.com/oauth2/authorize",
    tokenUri: "https://api.dropboxapi.com/oauth2/token",
    ...additionalOAuth2ClientConfig,
  });
}
