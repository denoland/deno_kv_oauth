// Copyright 2023-2024 the Deno authors. All rights reserved. MIT license.
import type { OAuth2ClientConfig } from "https://deno.land/x/oauth2_client@v1.0.2/mod.ts";
import { getRequiredEnv } from "./get_required_env.ts";

/**
 * Returns the OAuth configuration for LinkedIn.
 *
 * Requires `--allow-env[=LINKEDIN_CLIENT_ID,LINKEDIN_CLIENT_SECRET]` permissions
 * and environment variables:
 * 1. `LINKEDIN_CLIENT_ID`
 * 2. `LINKEDIN_CLIENT_SECRET`
 *
 * @example
 * ```ts
 * import { createLinkedInOAuthConfig } from "jsr:@deno/kv-oauth";
 *
 * const oauthConfig = createLinkedInOAuthConfig({
 *  redirectUri: "http://localhost:8000/callback",
 *  scope: ["profile", "email"],
 * });
 * ```
 *
 * @see {@link https://learn.microsoft.com/en-us/linkedin/shared/authentication/authorization-code-flow?context=linkedin%2Fcontext&tabs=HTTPS1}
 */
export function createLinkedInOAuthConfig(config: {
  /** @see {@linkcode OAuth2ClientConfig.redirectUri} */
  redirectUri: string;
  /** @see {@linkcode OAuth2ClientConfig.defaults}*/
  scope: string | string[];
}): OAuth2ClientConfig {
  const clientId = getRequiredEnv("LINKEDIN_CLIENT_ID");
  const clientSecret = getRequiredEnv("LINKEDIN_CLIENT_SECRET");
  return {
    clientId,
    clientSecret,
    authorizationEndpointUri: "https://www.linkedin.com/oauth/v2/authorization",
    tokenUri: "https://www.linkedin.com/oauth/v2/accessToken",
    redirectUri: config.redirectUri,
    defaults: {
      requestOptions: {
        body: {
          client_id: clientId,
          client_secret: clientSecret,
        },
      },
      scope: config.scope,
    },
  };
}
