// Copyright 2023-2024 the Deno authors. All rights reserved. MIT license.
import type { OAuth2ClientConfig } from "../deps.ts";
import { getRequiredEnv } from "./get_required_env.ts";

/**
 * Returns the OAuth configuration for Logto.
 *
 * Requires `--allow-env[=LOGTO_CLIENT_ID,LOGTO_CLIENT_SECRET,LOGTO_DOMAIN]` permissions
 * and environment variables:
 * 1. `LOGTO_CLIENT_ID`
 * 2. `LOGTO_CLIENT_SECRET`
 * 3. `LOGTO_DOMAIN`
 *
 * @example
 * ```ts
 * import { createLogtoOAuthConfig } from "https://deno.land/x/deno_kv_oauth/mod.ts";
 *
 * const oauthConfig = createLogtoOAuthConfig();
 * ```
 *
 * @see {@link https://docs.logto.io/docs/references/applications/}
 */
export function createLogtoOAuthConfig(config?: {
  /** @see {@linkcode OAuth2ClientConfig.redirectUri} */
  redirectUri?: string;
  /** @see {@linkcode OAuth2ClientConfig.defaults.scope} */
  scope?: string | string[];
}): OAuth2ClientConfig {
  const baseURL = getRequiredEnv("LOGTO_DOMAIN");
  return {
    clientId: getRequiredEnv("LOGTO_CLIENT_ID"),
    clientSecret: getRequiredEnv("LOGTO_CLIENT_SECRET"),
    authorizationEndpointUri: `${baseURL}/auth`,
    tokenUri: `${baseURL}/token`,
    redirectUri: config?.redirectUri,
    defaults: { scope: config?.scope },
  };
}
