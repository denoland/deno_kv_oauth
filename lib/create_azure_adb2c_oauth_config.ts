// Copyright 2023-2024 the Deno authors. All rights reserved. MIT license.
import type { OAuth2ClientConfig } from "@cmd-johnson/oauth2-client";
import { getRequiredEnv } from "./get_required_env.ts";

/**
 * Returns the OAuth configuration for Azure.
 *
 * Requires `--allow-env[=AZURE_ADB2C_CLIENT_ID,AZURE_ADB2C_CLIENT_SECRET,AZURE_ADB2C_DOMAIN,AZURE_ADB2C_POLICY,AZURE_ADB2C_TENANT_ID]`
 * permissions and environment variables:
 * 1. `AZURE_ADB2C_CLIENT_ID`
 * 2. `AZURE_ADB2C_CLIENT_SECRET`
 * 3. `AZURE_ADB2C_DOMAIN`
 * 4. `AZURE_ADB2C_POLICY`
 * 5. `AZURE_ADB2C_TENANT_ID`
 *
 * @example Usage
 * ```ts
 * import { createAzureAdb2cOAuthConfig } from "jsr:@deno/kv-oauth";
 *
 * const oauthConfig = createAzureAdb2cOAuthConfig({
 *   redirectUri: "http://localhost:8000/callback",
 *   scope: ["openid", Deno.env.get("AZURE_ADB2C_CLIENT_ID")!]
 * });
 * ```
 *
 * @see {@link https://learn.microsoft.com/en-us/entra/identity-platform/v2-protocols-oidc}
 */
export function createAzureAdb2cOAuthConfig(config: {
  /** @see {@linkcode OAuth2ClientConfig.redirectUri} */
  redirectUri?: string;
  /** @see {@linkcode OAuth2ClientConfig.defaults.scope} */
  scope: string | string[];
}): OAuth2ClientConfig {
  const baseUrl = `https://${
    getRequiredEnv(
      "AZURE_ADB2C_DOMAIN",
    )
  }/${getRequiredEnv("AZURE_ADB2C_TENANT_ID")}/${
    getRequiredEnv(
      "AZURE_ADB2C_POLICY",
    )
  }/oauth2/v2.0`;

  return {
    clientId: getRequiredEnv("AZURE_ADB2C_CLIENT_ID"),
    clientSecret: getRequiredEnv("AZURE_ADB2C_CLIENT_SECRET"),
    authorizationEndpointUri: `${baseUrl}/authorize`,
    tokenUri: `${baseUrl}/token`,
    redirectUri: config.redirectUri,
    defaults: {
      scope: config.scope,
    },
  };
}
