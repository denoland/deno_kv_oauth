// Copyright 2023-2024 the Deno authors. All rights reserved. MIT license.
import type { OAuth2ClientConfig } from "https://deno.land/x/oauth2_client@v1.0.2/mod.ts";
import { getRequiredEnv } from "./get_required_env.ts";

/**
 * Returns the OAuth configuration for Spotify.
 *
 * Requires `--allow-env[=SPOTIFY_CLIENT_ID,SPOTIFY_CLIENT_SECRET]` permissions
 * and environment variables:
 * 1. `SPOTIFY_CLIENT_ID`
 * 2. `SPOTIFY_CLIENT_SECRET`
 *
 * @example
 * ```ts
 * import { createSpotifyOAuthConfig } from "jsr:@deno/kv-oauth";
 *
 * const oauthConfig = createSpotifyOAuthConfig({
 *   scope: "user-read-private user-read-email"
 * });
 * ```
 *
 * @see {@link https://developer.spotify.com/documentation/web-api/tutorials/code-flow}
 */
export function createSpotifyOAuthConfig(
  config: {
    /** @see {@linkcode OAuth2ClientConfig.redirectUri} */
    redirectUri?: string;
    /** @see {@linkcode OAuth2ClientConfig.defaults.scope} */
    scope: string | string[];
  },
): OAuth2ClientConfig {
  return {
    clientId: getRequiredEnv("SPOTIFY_CLIENT_ID"),
    clientSecret: getRequiredEnv("SPOTIFY_CLIENT_SECRET"),
    authorizationEndpointUri: "https://accounts.spotify.com/authorize",
    tokenUri: "https://accounts.spotify.com/api/token",
    redirectUri: config.redirectUri,
    defaults: { scope: config.scope },
  };
}
