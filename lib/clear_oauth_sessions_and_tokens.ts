// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import {
  deleteLegacyTokens,
  deleteOAuthSession,
  deleteTokens,
  listLegacyTokens,
  listOAuthSessions,
  listTokens,
} from "./_core.ts";

/**
 * Deletes all OAuth sessions and tokens stored in KV.
 *
 * It does this by:
 * 1. Listing all OAuth session entries and asynchronously deleting them.
 * 2. Listing all legacy token entries and asynchronously deleting them.
 * 3. Listing all token entries and asynchronously deleting them.
 * 4. Waiting for all deletion tasks to complete.
 *
 * @example
 * ```ts
 * import { clearOAuthSessionsAndTokens } from "https://deno.land/x/deno_kv_oauth@$VERSION/mod.ts";
 *
 * await clearOAuthSessionsAndTokens();
 * ```
 */
export async function clearOAuthSessionsAndTokens() {
  const oauthSessionsIter = listOAuthSessions();
  const legacyTokensIter = listLegacyTokens();
  const tokensIter = listTokens();
  const promises = [];
  for await (const { key } of oauthSessionsIter) {
    promises.push(deleteOAuthSession(key[1] as string));
  }
  for await (const { key } of legacyTokensIter) {
    promises.push(deleteLegacyTokens(key[1] as string));
  }
  for await (const { key } of tokensIter) {
    promises.push(deleteTokens(key[1] as string));
  }
  await Promise.all(promises);
}
