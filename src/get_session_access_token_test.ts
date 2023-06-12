// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import { getSessionAccessToken } from "./get_session_access_token.ts";
import { assertEquals, assertRejects, SECOND, Tokens } from "../dev_deps.ts";
import {
  deleteStoredTokensBySiteSession,
  setTokensBySiteSession,
} from "./_core.ts";
import { oauth2Client } from "./_test_utils.ts";

Deno.test("getSessionAccessToken()", async (test) => {
  await test.step("returns null for non-existent session", async () => {
    assertEquals(await getSessionAccessToken(oauth2Client, "nil"), null);
  });

  await test.step("returns the access token for session without expiry", async () => {
    const sessionId = crypto.randomUUID();
    const tokens: Tokens = {
      accessToken: crypto.randomUUID(),
      tokenType: "Bearer",
    };
    await setTokensBySiteSession(sessionId, tokens);
    assertEquals(
      await getSessionAccessToken(oauth2Client, sessionId),
      tokens.accessToken,
    );

    // Cleanup
    await deleteStoredTokensBySiteSession(sessionId);
  });

  await test.step("returns the access token for session with far expiry", async () => {
    const sessionId = crypto.randomUUID();
    const tokens: Tokens = {
      accessToken: crypto.randomUUID(),
      tokenType: "Bearer",
      expiresIn: Date.now() + (30 * SECOND),
      refreshToken: crypto.randomUUID(),
    };
    await setTokensBySiteSession(sessionId, tokens);
    assertEquals(
      await getSessionAccessToken(oauth2Client, sessionId),
      tokens.accessToken,
    );

    // Cleanup
    await deleteStoredTokensBySiteSession(sessionId);
  });

  await test.step("attempts to return a fresh access token for expired session", async () => {
    const sessionId = crypto.randomUUID();
    const tokens: Tokens = {
      accessToken: crypto.randomUUID(),
      tokenType: "Bearer",
      expiresIn: 0,
      refreshToken: crypto.randomUUID(),
    };
    await setTokensBySiteSession(sessionId, tokens);
    assertRejects(async () =>
      await getSessionAccessToken(oauth2Client, sessionId)
    );

    // Cleanup
    await deleteStoredTokensBySiteSession(sessionId);
  });
});
