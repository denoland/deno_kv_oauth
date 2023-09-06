import type {
  OAuthConfig,
  OAuthPredefinedConfig,
  OAuthProviderConfig,
  OAuthUserConfig,
} from "../types.ts";
import { assert } from "https://deno.land/std@0.201.0/assert/assert.ts";

export { assert };

export function createOAuthConfig(
  providerConfig: OAuthProviderConfig & OAuthPredefinedConfig,
  userConfig: OAuthUserConfig,
): OAuthConfig {
  const prefix = providerConfig.name.toUpperCase();

  const fullConfig = {
    ...providerConfig,
    ...userConfig,
    clientId: fallbackToEnv(userConfig.clientId, `${prefix}_CLIENT_ID`),
    clientSecret: fallbackToEnv(
      userConfig.clientSecret,
      `${prefix}_CLIENT_SECRET`,
    ),
  };

  return fullConfig;
}

export function fallbackToEnv(
  explicitValue: string | undefined,
  envVarName: string,
): string | never {
  if (explicitValue) {
    return explicitValue;
  }
  let value;
  try {
    value = Deno.env.get(envVarName);
  } catch {
    // Env access denied
  }

  assert(value, `${envVarName} env var is required`);

  return value;
}
