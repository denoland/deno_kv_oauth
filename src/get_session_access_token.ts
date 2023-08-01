// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import { OAuth2Client, OAuth2ResponseError, SECOND, Tokens } from "../deps.ts";
import { getTokensBySession, SessionKey, setTokensBySession } from "./core.ts";

/**
 * Gets the access token for a given OAuth 2.0 client and session. If null is returned, the client must sign in.
 *
 * It does this by:
 * 1. Getting the OAuth 2.0 tokens from KV using the given session key. If the token doesn't exist, null is returned. If the token is valid, not close to expiry or unable to be refreshed, the access token is returned.
 * 2. Refreshing and updating the stored token in KV and returning the access token.
 *
 * @param getSessionKey Get the client's session key using {@linkcode getSessionKey}.
 *
 * @example
 * ```ts
 * import { getSessionAccessToken, createGitHubOAuth2Client, getSessionKey } from "https://deno.land/x/deno_kv_oauth@$VERSION/mod.ts";
 *
 * const oauth2Client = createGitHubOAuth2Client();
 *
 * async function handler(request: Request) {
 *   const sessionKey = getSessionKey(request);
 *   const accessToken = await getSessionAccessToken(oauth2Client, sessionKey!);
 * }
 * ```
 */
export async function getSessionAccessToken(
  oauth2Client: OAuth2Client,
  sessionKey: SessionKey,
) {
  // First, try with eventual consistency. If that returns null, try with strong consistency.
  const tokens = await getTokensBySession(sessionKey, "eventual") ||
    await getTokensBySession(sessionKey);
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

  await setTokensBySession(sessionKey, newTokens);

  return newTokens.accessToken;
}
