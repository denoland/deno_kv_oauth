// Copyright 2023 the Deno authors. All rights reserved. MIT license.

import type { OAuth2ClientConfig } from "../../deps.ts";
import { getRequiredEnv } from "./get_required_env.ts";

/**
 * Returns the OAuth configuration for GitLab.
 *
 * Requires `--allow-env[=GITLAB_CLIENT_ID,GITLAB_CLIENT_SECRET]` permissions and environment variables:
 * 1. `GITLAB_CLIENT_ID`
 * 2. `GITLAB_CLIENT_SECRET`
 *
 * @param redirectUri The URI of the client's redirection endpoint (sometimes also called callback URI).
 * @param scope Default scopes to request unless otherwise specified.
 *
 * @example
 * ```ts
 * import { createGitLabOAuthConfig } from "https://deno.land/x/deno_kv_oauth@$VERSION/mod.ts";
 *
 * const oauthConfig = createGitLabOAuthConfig("http://localhost:8000/callback", "profile");
 * ```
 *
 * @see {@link https://docs.gitlab.com/ee/api/oauth2.html}
 */
export function createGitLabOAuthConfig(
  redirectUri: string,
  scope: string | string[],
): OAuth2ClientConfig {
  return {
    clientId: getRequiredEnv("GITLAB_CLIENT_ID"),
    clientSecret: getRequiredEnv("GITLAB_CLIENT_SECRET"),
    authorizationEndpointUri: "https://gitlab.com/oauth/authorize",
    tokenUri: "https://gitlab.com/oauth/token",
    redirectUri,
    defaults: { scope },
  };
}
