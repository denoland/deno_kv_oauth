// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import { OAuth2Client, SECOND } from "../deps.ts";
import { getTokensBySiteSession, setTokensBySiteSession } from "./_core.ts";

export async function getSessionAccessToken(
  oauth2Client: OAuth2Client,
  sessionId: string,
) {
  const tokens = await getTokensBySiteSession(sessionId);
  if (tokens === null) return null;
  if (
    tokens.refreshToken === undefined ||
    // 5 second buffer
    (tokens.expiresIn && tokens.expiresIn < (5 * SECOND))
  ) {
    return tokens.accessToken;
  }

  // This is as far as automated testing can go
  /** @todo Return `null` when the refresh token expires */
  const newTokens = await oauth2Client.refreshToken.refresh(
    tokens.refreshToken,
  );
  await setTokensBySiteSession(sessionId, newTokens);

  return newTokens.accessToken;
}
