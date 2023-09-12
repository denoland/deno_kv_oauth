// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import type { OAuthUserConfig } from "../types.ts";
import { createOAuthConfig } from "../config.ts";

/**
 * Create a configuration for Xxx as the auth provider
 *
 * Requires `--allow-env[=XXX_CLIENT_ID,XXX_CLIENT_SECRET]` permissions and environment variables:
 * 1. `XXX_CLIENT_ID`
 * 2. `XXX_CLIENT_SECRET`
 *
 * @example
 * ```ts
 * import { createXxxOAuthConfig } from "https://deno.land/x/deno_kv_oauth@$VERSION/src/providers/xxx.ts";
 *
 * const oauthConfig = createXxxOAuthConfig({
 *  redirectUri: "http://localhost:8000/callback",
 * });
 * ```
 *
 * @param config Requires `redirectUri`
 *
 * @see {@link TO_PROVIDER_SPECIFIC_DOCS_HERE}
 */
export function createXxxOAuthConfig(config: OAuthUserConfig) {
  return createOAuthConfig({
    name: "Xxx",
    authorizationEndpointUri: "",
    tokenUri: "",
    scope: [],
  }, config);
}

export default createXxxOAuthConfig;
