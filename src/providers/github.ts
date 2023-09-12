// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import type { OAuthUserConfig } from "../types.ts";
import { createOAuthConfig } from "../config.ts";

/**
 * Create a configuration for GitHub as the auth provider
 *
 * Requires `--allow-env[=GITHUB_CLIENT_ID,GITHUB_CLIENT_SECRET]` permissions and environment variables:
 * 1. `GITHUB_CLIENT_ID`
 * 2. `GITHUB_CLIENT_SECRET`
 *
 * @example
 * ```ts
 * import { createGitHubOAuthConfig } from "https://deno.land/x/deno_kv_oauth@$VERSION/src/providers/github.ts";
 *
 * const oauthConfig = createGitHubOAuthConfig({
 *  redirectUri: "http://localhost:8000/callback",
 * });
 * ```
 *
 * @param config Requires `redirectUri`
 *
 * @see {@link https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps}
 */
export function createGitHubOAuthConfig(config: OAuthUserConfig) {
  return createOAuthConfig({
    name: "GitHub",
    authorizationEndpointUri: "https://github.com/login/oauth/authorize",
    tokenUri: "https://github.com/login/oauth/access_token",
    scope: ["user:email"],
  }, config);
}

export default createGitHubOAuthConfig;
