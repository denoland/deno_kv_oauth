// Copyright 2023 the Deno authors. All rights reserved. MIT license.

import type { OAuth2ClientConfig } from "../deps.ts";
import { getRequiredEnv } from "./get_required_env.ts";

/**
 * Returns the OAuth configuration for Facebook.
 *
 * Requires `--allow-env[=GITHUB_CLIENT_ID,GITHUB_CLIENT_SECRET]` permissions
 * and environment variables:
 * 1. `GITHUB_CLIENT_ID`
 * 2. `GITHUB_CLIENT_SECRET`
 *
 * @example
 * ```ts
 * import { createGitHubOAuthConfig } from "https://deno.land/x/deno_kv_oauth@$VERSION/mod.ts";
 *
 * const oauthConfig = createGitHubOAuthConfig();
 * ```
 *
 * @see {@link https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps}
 */
export function createGitHubOAuthConfig(
  config?: {
    /** @see {@linkcode OAuth2ClientConfig.redirectUri} */
    redirectUri?: string;
    /** @see {@linkcode OAuth2ClientConfig.defaults.scope} */
    scope?: string | string[];
  },
): OAuth2ClientConfig {
  return {
    clientId: getRequiredEnv("GITHUB_CLIENT_ID"),
    clientSecret: getRequiredEnv("GITHUB_CLIENT_SECRET"),
    authorizationEndpointUri: "https://github.com/login/oauth/authorize",
    tokenUri: "https://github.com/login/oauth/access_token",
    redirectUri: config?.redirectUri,
    defaults: { scope: config?.scope },
  };
}
