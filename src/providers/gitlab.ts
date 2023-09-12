// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import type { OAuthUserConfig } from "../types.ts";
import { createOAuthConfig } from "../config.ts";

/**
 * Create a configuration for GitLab as the auth provider
 *
 * Requires `--allow-env[=GITLAB_CLIENT_ID,GITLAB_CLIENT_SECRET]` permissions and environment variables:
 * 1. `GITLAB_CLIENT_ID`
 * 2. `GITLAB_CLIENT_SECRET`
 *
 * @example
 * ```ts
 * import { createGitLabOAuthConfig } from "https://deno.land/x/deno_kv_oauth@$VERSION/src/providers/gitlab.ts";
 *
 * const oauthConfig = createGitLabOAuthConfig({
 *  redirectUri: "http://localhost:8000/callback",
 * });
 * ```
 *
 * @param config Requires `redirectUri`
 *
 * @see {@link https://docs.gitlab.com/ee/api/oauth2.html}
 */
export function createGitLabOAuthConfig(config: OAuthUserConfig) {
  return createOAuthConfig({
    name: "GitLab",
    authorizationEndpointUri: "https://gitlab.com/oauth/authorize",
    tokenUri: "https://gitlab.com/oauth/token",
    scope: ["openid", "email"],
  }, config);
}

export default createGitLabOAuthConfig;
