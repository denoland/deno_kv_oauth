// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import {
  deleteOAuthSession,
  deleteStoredTokensBySession,
  listOAuthSessions,
  listTokens,
} from "./core.ts";

/**
 * Deletes all OAuth 2.0 sessions and tokens stored in KV.
 *
 * It does this by:
 * 1. Listing all OAuth 2.0 session entries and asynchronously deleting them.
 * 2. Listing all token entries and asynchronously deleting them.
 * 3. Waiting for all deletion tasks to complete.
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
  const tokensIter = listTokens();
  const promises = [];
  for await (const entry of oauthSessionsIter) {
    const oauthSessionId = entry.key[1] as string;
    promises.push(deleteOAuthSession(oauthSessionId));
  }
  for await (const entry of tokensIter) {
    const sessionId = entry.key[1] as string;
    promises.push(deleteStoredTokensBySession(sessionId));
  }
  await Promise.all(promises);
}
