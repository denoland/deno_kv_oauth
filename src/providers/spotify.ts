// Copyright 2023 the Deno authors. All rights reserved. MIT license.

import { OAuth2Client, OAuth2ClientConfig } from "../../deps.ts";
import type { WithRedirectUri, WithScope } from "./types.ts";

/**
 * Creates an OAuth 2.0 client with Spotify as the provider.
 *
 * Requires `--allow-env[=SPOTIFY_CLIENT_ID,SPOTIFY_CLIENT_SECRET]` permissions and environment variables:
 * 1. `SPOTIFY_CLIENT_ID`
 * 2. `SPOTIFY_CLIENT_SECRET`
 *
 * @param additionalOAuth2ClientConfig Requires `defaults.scope` property.
 *
 * @example
 * ```ts
 * import { createSpotifyOAuth2Client } from "https://deno.land/x/deno_kv_oauth@$VERSION/mod.ts";
 *
 * const oauth2Client = createSpotifyOAuth2Client({
 *  redirectUri: "http://localhost:8000/callback",
 *  defaults: {
 *    scope: "user-read-private user-read-email"
 *  }
 * });
 * ```
 *
 * @see {@link https://developer.spotify.com/documentation/web-api/tutorials/code-flow}
 */
export function createSpotifyOAuth2Client(
  additionalOAuth2ClientConfig:
    & Partial<OAuth2ClientConfig>
    & WithRedirectUri
    & WithScope,
): OAuth2Client {
  return new OAuth2Client({
    clientId: Deno.env.get("SPOTIFY_CLIENT_ID")!,
    clientSecret: Deno.env.get("SPOTIFY_CLIENT_SECRET")!,
    authorizationEndpointUri: "https://accounts.spotify.com/authorize",
    tokenUri: "https://accounts.spotify.com/api/token",
    ...additionalOAuth2ClientConfig,
  });
}
