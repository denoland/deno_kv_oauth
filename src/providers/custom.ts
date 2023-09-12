// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import type {
  OAuthEnvConfig,
  OAuthPredefinedConfig,
  OAuthProviderInfo,
  OAuthVariableConfig,
} from "../types.ts";
import { createOAuthConfig } from "../config.ts";

/**
 * Create a custom OAuth2 configuration
 *
 * Requires `--allow-env[=XXX_CLIENT_ID,XXX_CLIENT_SECRET]` permissions and environment variables:
 * 1. `XXX_CLIENT_ID`
 * 2. `XXX_CLIENT_SECRET`
 *
 * Where `XXX` is the `name` given to the function (in uppercase).
 *
 * @example
 * ```ts
 * import { createCustomOAuthConfig } from "https://deno.land/x/deno_kv_oauth@$VERSION/src/providers/custom.ts";
 *
 * const oauthConfig = createCustomOAuthConfig({
 *  name: "Custom",
 *  authorizationEndpointUri: "https://custom.com/oauth2/authorize",
 *  tokenUri: "https://custom.com/oauth2/token",
 *  scope: ["email"],
 *  redirectUri: "/callback"
 * });
 * ```
 */
export function createCustomOAuthConfig(
  config:
    & OAuthProviderInfo
    & OAuthPredefinedConfig
    & OAuthVariableConfig
    & Partial<OAuthEnvConfig>,
) {
  const { redirectUri, ...providerConfig } = config;
  return createOAuthConfig(providerConfig, { redirectUri });
}
