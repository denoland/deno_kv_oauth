// Copyright 2023-2024 the Deno authors. All rights reserved. MIT license.
import type { OAuth2ClientConfig } from '../deps.ts';
import { getRequiredEnv } from './get_required_env.ts';

/**
 * Returns the OAuth configuration for Azure.
 *
 * Requires `--allow-env[=AZURE_AD_CLIENT_ID,AZURE_AD_CLIENT_SECRET,AZURE_AD_CLOUD_INSTANCE,AZURE_AD_TENANT_ID]`
 * permissions and environment variables:
 * 1. `AZURE_AD_CLIENT_ID`
 * 2. `AZURE_AD_CLIENT_SECRET`
 * 3. `AZURE_AD_CLOUD_INSTANCE`
 * 4. `AZURE_AD_TENANT_ID`
 *
 * @example
 * ```ts
 * import { createAzureADOAuthConfig } from "https://deno.land/x/deno_kv_oauth@$VERSION/mod.ts";
 *
 * const oauthConfig = createAzureADOAuthConfig({
 *   redirectUri: "http://localhost:8000/callback",
 *   scope: "openid",
 * });
 * ```
 *
 * @see {@link https://learn.microsoft.com/en-us/entra/identity-platform/v2-protocols-oidc}
 */
export function createAzureADOAuthConfig(config: {
  /** @see {@linkcode OAuth2ClientConfig.redirectUri} */
  redirectUri?: string;
  /** @see {@linkcode OAuth2ClientConfig.defaults.scope} */
  scope: string | string[];
}): OAuth2ClientConfig {
  let cloudInstance = getRequiredEnv('AZURE_AD_CLOUD_INSTANCE');

  if (!cloudInstance.endsWith('/')) {
    cloudInstance = `${cloudInstance}/`;
  }

  const tenantId = getRequiredEnv('AZURE_AD_TENANT_ID');

  const policy = Deno.env.get('AZURE_AD_POLICY');

  const path = policy ? `${tenantId}/${policy}` : tenantId;

  const baseURL = `${cloudInstance}${path}/oauth2`;

  const clientId = getRequiredEnv('AZURE_AD_CLIENT_ID');

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
    clientSecret: getRequiredEnv('AZURE_AD_CLIENT_SECRET'),
    authorizationEndpointUri: `${baseURL}/v2.0/authorize`,
    tokenUri: `${baseURL}/v2.0/token`,
    redirectUri: config.redirectUri,
    defaults: {
      scope: config.scope,
    },
  };
}
