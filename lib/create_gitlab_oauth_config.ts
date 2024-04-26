// Copyright 2023-2024 the Deno authors. All rights reserved. MIT license.
import type { OAuth2ClientConfig } from "https://deno.land/x/oauth2_client@v1.0.2/mod.ts";
import { getRequiredEnv } from "./get_required_env.ts";

/**
 * Returns the OAuth configuration for GitLab.
 *
 * Requires `--allow-env[=GITLAB_CLIENT_ID,GITLAB_CLIENT_SECRET]` permissions
 * and environment variables:
 * 1. `GITLAB_CLIENT_ID`
 * 2. `GITLAB_CLIENT_SECRET`
 *
 * @example
 * ```ts
 * import { createGitLabOAuthConfig } from "jsr:@deno/kv-oauth";
 *
 * const oauthConfig = createGitLabOAuthConfig({
 *   redirectUri: "http://localhost:8000/callback",
 *   scope: "profile",
 * });
 * ```
 *
 * @see {@link https://docs.gitlab.com/ee/api/oauth2.html}
 */
export function createGitLabOAuthConfig(
  config: {
    /** @see {@linkcode OAuth2ClientConfig.redirectUri} */
    redirectUri: string;
    /** @see {@linkcode OAuth2ClientConfig.defaults.scope} */
    scope: string | string[];
  },
): OAuth2ClientConfig {
  return {
    clientId: getRequiredEnv("GITLAB_CLIENT_ID"),
    clientSecret: getRequiredEnv("GITLAB_CLIENT_SECRET"),
    authorizationEndpointUri: "https://gitlab.com/oauth/authorize",
    tokenUri: "https://gitlab.com/oauth/token",
    redirectUri: config.redirectUri,
    defaults: { scope: config.scope },
  };
}
