// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import { OAuth2Client, OAuth2ResponseError, SECOND, Tokens } from "../deps.ts";
import { getTokensBySession, setTokensBySession } from "./core.ts";

/**
 * Gets the access token for a given OAuth 2.0 client and session. If null is returned, the client must sign in.
 *
 * It does this by:
 * 1. Getting the OAuth 2.0 tokens from KV using the given session ID. If the token doesn't exist, null is returned. If the token is valid, not close to expiry or unable to be refreshed, the access token is returned.
 * 2. Refreshing and updating the stored token in KV and returning the access token.
 *
 * @param sessionId Get the client's session ID using {@linkcode getSessionId}.
 *
 * @example.
 * ```ts
 * import { getSessionAccessToken, createGitHubOAuth2Client } from "https://deno.land/x/deno_kv_oauth@$VERSION/mod.ts";
 *
 * const oauth2Client = createGitHubOAuth2Client();
 * const accessToken = await getSessionAccessToken(oauth2Client, "my-session-id");
 * ```
 */
export async function getSessionAccessToken(
  oauth2Client: OAuth2Client,
  sessionId: string,
) {
  // First, try with eventual consistency. If that returns null, try with strong consistency.
  const tokens = await getTokensBySession(sessionId, "eventual") ||
    await getTokensBySession(sessionId);
  if (tokens === null) return null;
  if (
    tokens.refreshToken === undefined ||
    // 5 second buffer
    (tokens.expiresIn && tokens.expiresIn < (5 * SECOND))
  ) {
    return tokens.accessToken;
  }

  // This is as far as automated testing can go.
  let newTokens: Tokens;
  try {
    newTokens = await oauth2Client.refreshToken.refresh(tokens.refreshToken);
  } catch (error) {
    if (
      error instanceof OAuth2ResponseError && error.error === "invalid_grant"
    ) {
      // The refresh token is likely expired
      return null;
    }
    throw error;
  }

  await setTokensBySession(sessionId, newTokens);

  return newTokens.accessToken;
}
