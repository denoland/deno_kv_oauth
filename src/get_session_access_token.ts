// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import {
  OAuth2Client,
  OAuth2ClientConfig,
  OAuth2ResponseError,
  Tokens,
} from "../deps.ts";
import { getTokens, setTokens } from "./core.ts";

/**
 * Gets the access token for the given OAuth configuration and session. If null
 * is returned, the client must sign in.
 *
 * It does this by:
 * 1. Getting the OAuth tokens from KV using the given session ID. If the
 * token doesn't exist, null is returned. If the token is valid, not close to
 * expiry or unable to be refreshed, the access token is returned.
 * 2. Refreshing and updating the stored token in KV and returning the access
 * token.
 *
 * @param sessionId Get the client's session ID using {@linkcode getSessionId}.
 *
 * @example.
 * ```ts
 * import { getSessionAccessToken, createGitHubOAuthConfig } from "https://deno.land/x/deno_kv_oauth@$VERSION/mod.ts";
 *
 * const oauthConfig = createGitHubOAuthConfig();
 * const accessToken = await getSessionAccessToken(oauthConfig, "my-session-id");
 * ```
 */
export async function getSessionAccessToken(
  /** @see {@linkcode OAuth2ClientConfig} */
  oauthConfig: OAuth2ClientConfig,
  sessionId: string,
) {
  /**
   * First, try with eventual consistency. If that returns null, try with strong
   * consistency.
   */
  const tokens = await getTokens(sessionId, "eventual") ||
    await getTokens(sessionId);
  if (tokens === null) return null;
  if (
    tokens.refreshToken === undefined ||
    tokens.expiresIn === undefined ||
    // 5 second buffer
    tokens.expiresIn > 5
  ) {
    return tokens.accessToken;
  }

  // This is as far as automated testing can go.
  let newTokens: Tokens;
  try {
    newTokens = await new OAuth2Client(oauthConfig)
      .refreshToken.refresh(tokens.refreshToken);
  } catch (error) {
    if (
      error instanceof OAuth2ResponseError && error.error === "invalid_grant"
    ) {
      // The refresh token is likely expired
      return null;
    }
    throw error;
  }

  await setTokens(sessionId, newTokens);

  return newTokens.accessToken;
}
