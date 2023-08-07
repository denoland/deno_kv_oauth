// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import {
  deleteOAuthSession,
  deleteStoredTokensBySession,
  listExpiredOAuthSessions,
  listExpiredTokens,
} from "./core.ts";

/**
 * Deletes stored KV entries such as OAuth 2.0 session and token that are expired, exclusively.
 *
 * Expired entries are defined as those whose expiry timestamps lie between the epoch and now.
 *
 * It is recommended to run this function regularly as a cron job, if possible.
 *
 * It does this by:
 * 1. Listing expired OAuth 2.0 session entries and asynchronously deleting them.
 * 2. Listing expired tokens entries and asynchronously deleting them.
 * 3. Waiting for all deletion tasks to complete.
 *
 * @example
 * ```ts
 * import { cleanExpired } from "https://deno.land/x/deno_kv_oauth@$VERSION/mod.ts";
 *
 * await cleanExpired();
 * ```
 */
export async function cleanExpired() {
  const expiredOAuthSessionsIter = listExpiredOAuthSessions();
  const expiredTokensIter = listExpiredTokens();
  const promises = [];
  for await (const { key } of expiredOAuthSessionsIter) {
    promises.push(deleteOAuthSession(key[1] as string));
  }
  for await (const { key } of expiredTokensIter) {
    promises.push(deleteStoredTokensBySession(key[1] as string));
  }
  await Promise.all(promises);
}
