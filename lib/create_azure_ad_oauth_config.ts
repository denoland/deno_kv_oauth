// Copyright 2023-2024 the Deno authors. All rights reserved. MIT license.
import type { OAuth2ClientConfig } from "../deps.ts";
import { getRequiredEnv } from "./get_required_env.ts";

/**
 * Returns the OAuth configuration for Azure.
 *
 * Requires `--allow-env[=AZURE_AD_CLIENT_ID,AZURE_AD_CLIENT_SECRET,AZURE_AD_TENANT_ID]`
 * permissions and environment variables:
 * 1. `AZURE_AD_CLIENT_ID`
 * 2. `AZURE_AD_CLIENT_SECRET`
 * 4. `AZURE_AD_TENANT_ID`
 *
 * @example
 * ```ts
 * import { createAzureAdOAuthConfig } from "https://deno.land/x/deno_kv_oauth@$VERSION/mod.ts";
 *
 * const oauthConfig = createAzureAdOAuthConfig({
 *   redirectUri: "http://localhost:8000/callback",
 *   scope: ["openid", Deno.env.get("AZURE_AD_CLIENT_ID")!]
 * });
 * ```
 *
 * @see {@link https://learn.microsoft.com/en-us/entra/identity-platform/v2-protocols-oidc}
 */
export function createAzureAdOAuthConfig(config: {
  /** @see {@linkcode OAuth2ClientConfig.redirectUri} */
  redirectUri?: string;
  /** @see {@linkcode OAuth2ClientConfig.defaults.scope} */
  scope: string | string[];
}): OAuth2ClientConfig {
  const baseUrl = `https://login.microsoftonline.com/${
    getRequiredEnv(
      "AZURE_AD_TENANT_ID",
    )
  }/oauth2/v2.0`;

  return {
    clientId: getRequiredEnv("AZURE_AD_CLIENT_ID"),
    clientSecret: getRequiredEnv("AZURE_AD_CLIENT_SECRET"),
    authorizationEndpointUri: `${baseUrl}/authorize`,
    tokenUri: `${baseUrl}/token`,
    redirectUri: config.redirectUri,
    defaults: {
      scope: config.scope,
    },
  };
}
