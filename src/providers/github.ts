// Copyright 2023 the Deno authors. All rights reserved. MIT license.

import { OAuth2Client, OAuth2ClientConfig } from "../../deps.ts";

/**
 * Creates an OAuth 2.0 client with GitHub as the provider.
 *
 * Requires `--allow-env[=GITHUB_CLIENT_ID,GITHUB_CLIENT_SECRET]` permissions and environment variables:
 * 1. `GITHUB_CLIENT_ID`
 * 2. `GITHUB_CLIENT_SECRET`
 *
 * @example
 * ```ts
 * import { createGitHubOAuth2Client } from "https://deno.land/x/deno_kv_oauth@$VERSION/mod.ts";
 *
 * const oauth2Client = createGitHubOAuth2Client();
 * ```
 *
 * @see {@link https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps}
 */
export function createGitHubOAuth2Client(
  additionalOAuth2ClientConfig?: Partial<OAuth2ClientConfig>,
): OAuth2Client {
  return new OAuth2Client({
    clientId: Deno.env.get("GITHUB_CLIENT_ID")!,
    clientSecret: Deno.env.get("GITHUB_CLIENT_SECRET")!,
    authorizationEndpointUri: "https://github.com/login/oauth/authorize",
    tokenUri: "https://github.com/login/oauth/access_token",
    ...additionalOAuth2ClientConfig,
  });
}
