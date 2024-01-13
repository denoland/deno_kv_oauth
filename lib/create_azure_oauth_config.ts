// Copyright 2023-2024 the Deno authors. All rights reserved. MIT license.
import type { OAuth2ClientConfig } from "../deps.ts";
import { getRequiredEnv } from "./get_required_env.ts";

/**
 * Returns the OAuth configuration for Azure.
 *
 * Requires `--allow-env[=AZURE_CLIENT_ID,AZURE_CLIENT_SECRET,AZURE_CLOUD_INSTANCE,AZURE_TENANT_ID]`
 * permissions and environment variables:
 * 1. `AZURE_CLIENT_ID`
 * 2. `AZURE_CLIENT_SECRET`
 * 3. `AZURE_CLOUD_INSTANCE`
 * 4. `AZURE_TENANT_ID`
 *
 * @example
 * ```ts
 * import { createAzureOAuthConfig } from "https://deno.land/x/deno_kv_oauth@$VERSION/mod.ts";
 *
 * const oauthConfig = createAzureOAuthConfig({
 *   envPrefix: "AZURE",
 *   redirectUri: "http://localhost:8000/callback",
 *   scope: "openid",
 * });
 * ```
 *
 * You can use a separate environment variable prefix with the envPrefix configureation.
 * Requires `--allow-env[=MY_PREFIX_CLIENT_ID,MY_PREFIX_CLIENT_SECRET,MY_PREFIX_CLOUD_INSTANCE,MY_PREFIX_TENANT_ID]`
 * permissions and environment variables:
 * 1. `MY_PREFIX_CLIENT_ID`
 * 2. `MY_PREFIX_CLIENT_SECRET`
 * 3. `MY_PREFIX_CLOUD_INSTANCE`
 * 4. `MY_PREFIX_TENANT_ID`
 *
 * @example
 * ```ts
 * import { createAzureOAuthConfig } from "https://deno.land/x/deno_kv_oauth@$VERSION/mod.ts";
 *
 * const oauthConfig = createAzureOAuthConfig({
 *   envPrefix: "MY_PREFIX",
 *   redirectUri: "http://localhost:8000/callback",
 *   scope: "openid",
 * });
 * ```
 *
 * This also supports the ability to connect with Azure AD B2C instances using the
 * proper configurations for AD B2C instances
 *
 * @see {@link https://learn.microsoft.com/en-us/entra/identity-platform/v2-protocols-oidc}
 */
export function createAzureOAuthConfig(config: {
  /** Used to set the prefix used to access environment variables; defaults to `AZURE`.*/
  envPrefix?: string;
  /** @see {@linkcode OAuth2ClientConfig.redirectUri} */
  redirectUri?: string;
  /** @see {@linkcode OAuth2ClientConfig.defaults.scope} */
  scope: string[];
}): OAuth2ClientConfig {
  const getEnv = (key: string) => {
    return getRequiredEnv(getEnvKey(key));
  };

  const getEnvKey = (key: string) => {
    return `${config.envPrefix || "AZURE"}_${key}`;
  };

  let cloudInstance = getEnv("CLOUD_INSTANCE");

  if (!cloudInstance.endsWith("/")) {
    cloudInstance = `${cloudInstance}/`;
  }

  const tenantId = getEnv("TENANT_ID");

  const policy = Deno.env.get(getEnvKey("POLICY"));

  const path = policy ? `${tenantId}/${policy}` : tenantId;

  const baseURL = `${cloudInstance}${path}/oauth2`;

  const clientId = getEnv("CLIENT_ID");

  if (policy) {
    config.scope.push(clientId);
  }

  // const urlParams: Record<string, string> | undefined = policy
  //   ? { p: policy }
  //   : undefined;

  return {
    clientId,
    clientSecret: getEnv("CLIENT_SECRET"),
    authorizationEndpointUri: `${baseURL}/v2.0/authorize`,
    tokenUri: `${baseURL}/v2.0/token`,
    redirectUri: config.redirectUri,
    defaults: {
      scope: config.scope,
      // requestOptions: {
      //   urlParams: urlParams,
      // },
    },
  };
}
