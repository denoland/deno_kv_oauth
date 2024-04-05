// Copyright 2023-2024 the Deno authors. All rights reserved. MIT license.
import type { OAuth2ClientConfig } from "../deps.ts";
import { getRequiredEnv } from "./get_required_env.ts";

/**
 * Returns the OAuth configuration for Logto.
 *
 * Requires `--allow-env[=CLERK_CLIENT_ID,CLERK_CLIENT_SECRET,CLERK_DOMAIN]` permissions
 * and environment variables:
 * 1. `CLERK_CLIENT_ID`
 * 2. `CLERK_CLIENT_SECRET`
 * 3. `CLERK_DOMAIN`
 *
 * @example
 * ```ts
 * import { createClerkOAuthConfig } from "https://deno.land/x/deno_kv_oauth/mod.ts";
 *
 * const oauthConfig = createClerkOAuthConfig();
 * ```
 *
 * @see {@link https://clerk.com/docs/advanced-usage/clerk-idp}
 */
export function createClerkOAuthConfig(config?: {
  /** @see {@linkcode OAuth2ClientConfig.redirectUri} */
  redirectUri?: string;
  /** @see {@linkcode OAuth2ClientConfig.defaults.scope} */
  scope?: string | string[];
}): OAuth2ClientConfig {
  const baseURL = getRequiredEnv("CLERK_DOMAIN");
  return {
    clientId: getRequiredEnv("CLERK_CLIENT_ID"),
    clientSecret: getRequiredEnv("CLERK_CLIENT_SECRET"),
    authorizationEndpointUri: `${baseURL}/authorize`,
    tokenUri: `${baseURL}/token`,
    redirectUri: config?.redirectUri,
    defaults: { scope: config?.scope },
  };
}
