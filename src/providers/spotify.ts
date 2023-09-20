// Copyright 2023 the Deno authors. All rights reserved. MIT license.

import type { OAuth2ClientConfig } from "../../deps.ts";
import { getRequiredEnv } from "./get_required_env.ts";

/**
 * Returns the OAuth configuration for Spotify.
 *
 * Requires `--allow-env[=SPOTIFY_CLIENT_ID,SPOTIFY_CLIENT_SECRET]` permissions and environment variables:
 * 1. `SPOTIFY_CLIENT_ID`
 * 2. `SPOTIFY_CLIENT_SECRET`
 *
 * @param redirectUri The URI of the client's redirection endpoint (sometimes also called callback URI).
 * @param scope Scopes to request.
 *
 * @example
 * ```ts
 * import { createSpotifyOAuthConfig } from "https://deno.land/x/deno_kv_oauth@$VERSION/mod.ts";
 *
 * const oauthConfig = createSpotifyOAuthConfig("user-read-private user-read-email");
 * ```
 *
 * @see {@link https://developer.spotify.com/documentation/web-api/tutorials/code-flow}
 */
export function createSpotifyOAuthConfig(
  scope: string | string[],
  redirectUri?: string,
): OAuth2ClientConfig {
  return {
    clientId: getRequiredEnv("SPOTIFY_CLIENT_ID"),
    clientSecret: getRequiredEnv("SPOTIFY_CLIENT_SECRET"),
    authorizationEndpointUri: "https://accounts.spotify.com/authorize",
    tokenUri: "https://accounts.spotify.com/api/token",
    redirectUri,
    defaults: { scope },
  };
}
