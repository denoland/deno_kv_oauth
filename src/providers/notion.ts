// Copyright 2023 the Deno authors. All rights reserved. MIT license.

import { OAuth2Client, OAuth2ClientConfig } from "../../deps.ts";

/**
 * Creates an OAuth 2.0 client with Notion as the provider.
 *
 * Requires `--allow-env[=NOTION_CLIENT_ID,NOTION_CLIENT_SECRET]` permissions and environment variables:
 * 1. `NOTION_CLIENT_ID`
 * 2. `NOTION_CLIENT_SECRET`
 *
 * @example
 * ```ts
 * import { createNotionOAuth2Client } from "https://deno.land/x/deno_kv_oauth@$VERSION/mod.ts";
 *
 * const oauth2Client = createNotionOAuth2Client();
 * ```
 *
 * @see {@link https://developers.notion.com/docs/authorization}
 */
export function createNotionOAuth2Client(
  additionalOAuth2ClientConfig?: Partial<OAuth2ClientConfig>,
): OAuth2Client {
  return new OAuth2Client({
    clientId: Deno.env.get("NOTION_CLIENT_ID")!,
    clientSecret: Deno.env.get("NOTION_CLIENT_SECRET")!,
    authorizationEndpointUri:
      "https://api.notion.com/v1/oauth/authorize?owner=user",
    tokenUri: "https://api.notion.com/v1/oauth/token",
    ...additionalOAuth2ClientConfig,
  });
}
