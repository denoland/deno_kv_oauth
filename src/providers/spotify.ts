// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import type { OAuthUserConfig } from "../types.ts";
import { createOAuthConfig } from "../config.ts";

/**
 * Create a configuration for Spotify as the auth provider
 *
 * Requires `--allow-env[=SPOTIFY_CLIENT_ID,SPOTIFY_CLIENT_SECRET]` permissions and environment variables:
 * 1. `SPOTIFY_CLIENT_ID`
 * 2. `SPOTIFY_CLIENT_SECRET`
 *
 * @example
 * ```ts
 * import { createSpotifyOAuthConfig } from "https://deno.land/x/deno_kv_oauth@$VERSION/src/providers/spotify.ts";
 *
 * const oauthConfig = createSpotifyOAuthConfig({
 *  redirectUri: "http://localhost:8000/callback",
 * });
 * ```
 *
 * @param config Requires `redirectUri`
 *
 * @see {@link https://developer.spotify.com/documentation/web-api/tutorials/code-flow}
 */
export function createSpotifyOAuthConfig(config: OAuthUserConfig) {
  return createOAuthConfig({
    name: "Spotify",
    authorizationEndpointUri: "https://accounts.spotify.com/authorize",
    tokenUri: "https://accounts.spotify.com/api/token",
    scope: ["user-read-email"],
  }, config);
}

export default createSpotifyOAuthConfig;
