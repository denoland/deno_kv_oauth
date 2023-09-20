// Copyright 2023 the Deno authors. All rights reserved. MIT license.

import { OAuth2Client, OAuth2ClientConfig } from "../../deps.ts";
import type { WithRedirectUri, WithScope } from "./types.ts";

/**
 * Creates an OAuth 2.0 client with GitLab as the provider.
 *
 * Requires `--allow-env[=GITLAB_CLIENT_ID,GITLAB_CLIENT_SECRET]` permissions and environment variables:
 * 1. `GITLAB_CLIENT_ID`
 * 2. `GITLAB_CLIENT_SECRET`
 *
 * @param additionalOAuth2ClientConfig Requires `redirectUri` and `defaults.scope` properties.
 *
 * @example
 * ```ts
 * import { createGitLabOAuth2Client } from "https://deno.land/x/deno_kv_oauth@$VERSION/mod.ts";
 *
 * const oauth2Client = createGitLabOAuth2Client({
 *  redirectUri: "http://localhost:8000/callback",
 *  defaults: {
 *    scope: "profile"
 *  }
 * });
 * ```
 *
 * @see {@link https://docs.gitlab.com/ee/api/oauth2.html}
 */
export function createGitLabOAuth2Client(
  additionalOAuth2ClientConfig:
    & Partial<OAuth2ClientConfig>
    & WithRedirectUri
    & WithScope,
): OAuth2Client {
  return new OAuth2Client({
    clientId: Deno.env.get("GITLAB_CLIENT_ID")!,
    clientSecret: Deno.env.get("GITLAB_CLIENT_SECRET")!,
    authorizationEndpointUri: "https://gitlab.com/oauth/authorize",
    tokenUri: "https://gitlab.com/oauth/token",
    ...additionalOAuth2ClientConfig,
  });
}
