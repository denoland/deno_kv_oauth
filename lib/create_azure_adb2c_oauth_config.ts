// Copyright 2023-2024 the Deno authors. All rights reserved. MIT license.
import type { OAuth2ClientConfig } from '../deps.ts';
import { getRequiredEnv } from './get_required_env.ts';

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
 * @example
 * ```ts
 * import { createAzureADB2COAuthConfig } from "https://deno.land/x/deno_kv_oauth@$VERSION/mod.ts";
 *
 * const oauthConfig = createAzureADB2COAuthConfig({
 *   redirectUri: "http://localhost:8000/callback",
 *   scope: "openid",
 * });
 * ```
 *
 * @see {@link https://learn.microsoft.com/en-us/entra/identity-platform/v2-protocols-oidc}
 */
export function createAzureADB2COAuthConfig(config: {
  /** @see {@linkcode OAuth2ClientConfig.redirectUri} */
  redirectUri?: string;
  /** @see {@linkcode OAuth2ClientConfig.defaults.scope} */
  scope: string | string[];
}): OAuth2ClientConfig {
  const baseUrl = `https://${getRequiredEnv(
    'AZURE_ADB2C_DOMAIN'
  )}/${getRequiredEnv('AZURE_ADB2C_TENANT_ID')}/${getRequiredEnv(
    'AZURE_ADB2C_POLICY'
  )}/oauth2/v2.0`;

  const clientId = getRequiredEnv('AZURE_ADB2C_CLIENT_ID');

  if (
    Array.isArray(config.scope) &&
    config.scope.some((s) => s === 'openid') &&
    !config.scope.some((s) => s === clientId)
  ) {
    config.scope.push(clientId);
  } else if (
    typeof config.scope === 'string' &&
    config.scope.includes('openid') &&
    !config.scope.includes(clientId)
  ) {
    config.scope = `${config.scope} ${clientId}`;
  }

  return {
    clientId,
    clientSecret: getRequiredEnv('AZURE_ADB2C_CLIENT_SECRET'),
    authorizationEndpointUri: `${baseUrl}/authorize`,
    tokenUri: `${baseUrl}/token`,
    redirectUri: config.redirectUri,
    defaults: {
      scope: config.scope,
    },
  };
}
