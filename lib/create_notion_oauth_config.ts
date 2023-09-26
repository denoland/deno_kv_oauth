// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import type { OAuth2ClientConfig } from "../deps.ts";
import { getRequiredEnv } from "./get_required_env.ts";

/**
 * Returns the OAuth configuration for Google.
 *
 * Requires `--allow-env[=NOTION_CLIENT_ID,NOTION_CLIENT_SECRET]` permissions
 * and environment variables:
 * 1. `NOTION_CLIENT_ID`
 * 2. `NOTION_CLIENT_SECRET`
 *
 * @example
 * ```ts
 * import { createNotionOAuthConfig } from "https://deno.land/x/deno_kv_oauth@$VERSION/mod.ts";
 *
 * const oauthConfig = createNotionOAuthConfig();
 * ```
 *
 * @see {@link https://developers.notion.com/docs/authorization}
 */
export function createNotionOAuthConfig(
  config?: {
    /** @see {@linkcode OAuth2ClientConfig.redirectUri} */
    redirectUri?: string;
    /** @see {@linkcode OAuth2ClientConfig.defaults.scope} */
    scope?: string | string[];
  },
): OAuth2ClientConfig {
  return {
    clientId: getRequiredEnv("NOTION_CLIENT_ID"),
    clientSecret: getRequiredEnv("NOTION_CLIENT_SECRET"),
    authorizationEndpointUri:
      "https://api.notion.com/v1/oauth/authorize?owner=user",
    tokenUri: "https://api.notion.com/v1/oauth/token",
    redirectUri: config?.redirectUri,
    defaults: { scope: config?.scope },
  };
}
