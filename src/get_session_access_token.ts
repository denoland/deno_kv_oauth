// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import { getTokens } from "./core.ts";

/**
 * Gets the access token for a given OAuth 2.0 client and session. If null is returned, the client must sign in.
 *
 * It does this by:
 * 1. Getting the OAuth 2.0 tokens from KV using the given session ID. If the token doesn't exist, null is returned.
 *
 * @param sessionId Get the client's session ID using {@linkcode getSessionId}.
 *
 * @example.
 * ```ts
 * import { getSessionAccessToken } from "https://deno.land/x/deno_kv_oauth@$VERSION/mod.ts";
 *
 * const accessToken = await getSessionAccessToken("my-session-id");
 * ```
 */
export async function getSessionAccessToken(sessionId: string) {
  // First, try with eventual consistency. If that returns null, try with strong consistency.
  const tokens = await getTokens(sessionId, "eventual") ||
    await getTokens(sessionId);
  return tokens?.accessToken || null;
}
