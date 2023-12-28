// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import type { OAuth2ClientConfig } from "../deps.ts";
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
 * import { createLinkedInOAuthConfig } from "https://deno.land/x/deno_kv_oauth@$VERSION/mod.ts";
 *
 * const oauthConfig = createLinkedInOAuthConfig({
 *  redirectUri: "http://localhost:8000/callback",
 *  scope: "r_liteprofile r_emailaddress"
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
