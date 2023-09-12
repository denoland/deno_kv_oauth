// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import type { OAuthUserConfig } from "../types.ts";
import { createOAuthConfig } from "../config.ts";

/**
 * Create a configuration for Notion as the auth provider
 *
 * Requires `--allow-env[=NOTION_CLIENT_ID,NOTION_CLIENT_SECRET]` permissions and environment variables:
 * 1. `NOTION_CLIENT_ID`
 * 2. `NOTION_CLIENT_SECRET`
 *
 * @example
 * ```ts
 * import { createNotionOAuthConfig } from "https://deno.land/x/deno_kv_oauth@$VERSION/src/providers/notion.ts";
 *
 * const oauthConfig = createNotionOAuthConfig({
 *  redirectUri: "http://localhost:8000/callback",
 * });
 * ```
 *
 * @param config Requires `redirectUri`
 *
 * @see {@link https://developers.notion.com/docs/authorization}
 */
export function createNotionOAuthConfig(config: OAuthUserConfig) {
  return createOAuthConfig({
    name: "Notion",
    authorizationEndpointUri:
      "https://api.notion.com/v1/oauth/authorize?owner=user",
    tokenUri: "https://api.notion.com/v1/oauth/token",
    scope: [],
  }, config);
}

export default createNotionOAuthConfig;
