// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import type {
  OAuthConfig,
  OAuthPredefinedConfig,
  OAuthProviderInfo,
  OAuthUserConfig,
} from "./types.ts";
import { assert } from "https://deno.land/std@0.201.0/assert/assert.ts";

export function createOAuthConfig(
  providerConfig:
    & OAuthProviderInfo
    & OAuthPredefinedConfig
    & Partial<OAuthUserConfig>,
  userConfig: OAuthUserConfig,
): OAuthConfig {
  const prefix = providerConfig.name.toUpperCase();

  return {
    ...providerConfig,
    ...userConfig,
    clientId: fallbackToEnv(
      userConfig?.clientId ?? providerConfig.clientId,
      `${prefix}_CLIENT_ID`,
    ),
    clientSecret: fallbackToEnv(
      userConfig?.clientSecret ?? providerConfig.clientSecret,
      `${prefix}_CLIENT_SECRET`,
    ),
  };
}

export function fallbackToEnv(
  explicitValue: string | undefined,
  envVarName: string,
): string | never {
  if (explicitValue) {
    return explicitValue;
  }

  const value = Deno.env.get(envVarName);
  assert(value, `${envVarName} env var is required`);
  return value;
}
