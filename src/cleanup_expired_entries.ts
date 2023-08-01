// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import {
  deleteOAuthSession,
  deleteStoredTokensBySession,
  listExpiredOAuthSessions,
  listExpiredTokens,
  SessionKey,
} from "./core.ts";

/**
 * Deletes stored KV entries such as OAuth 2.0 session and token that are expired, exclusively.
 *
 * Expired entries are defined as those whose expiry timestamps lie between the epoch and now.
 *
 * It does this by:
 * 1. Listing expired OAuth 2.0 session entries and asynchronously deleting them.
 * 2. Listing expired tokens entries and asynchronously deleting them.
 * 3. Waiting for all deletion tasks to complete.
 *
 * @example
 * ```ts
 * import { cleanupExpiredEntries } from "https://deno.land/x/deno_kv_oauth@$VERSION/mod.ts";
 *
 * await cleanupExpiredEntries();
 * ```
 */
export async function cleanupExpiredEntries() {
  const expiredOAuthSessionsIter = listExpiredOAuthSessions();
  const expiredTokensIter = listExpiredTokens();
  const promises = [];
  for await (const { key } of expiredOAuthSessionsIter) {
    promises.push(deleteOAuthSession(key.slice(1) as SessionKey));
  }
  for await (const { key } of expiredTokensIter) {
    promises.push(deleteStoredTokensBySession(key.slice(1) as SessionKey));
  }
  await Promise.all(promises);
}
