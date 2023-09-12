// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import type { OAuthConfig } from "../types.ts";

// Resolve a relative redirectUri in the config against a base URL
export function resolveRedirectUri(
  config: OAuthConfig,
  baseURL: string | URL,
): OAuthConfig {
  if (
    typeof config.redirectUri === "string" && !URL.canParse(config.redirectUri)
  ) {
    return {
      ...config,
      redirectUri: new URL(config.redirectUri, baseURL),
    };
  }
  return config;
}
