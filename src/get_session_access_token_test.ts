// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import { getSessionAccessToken } from "./get_session_access_token.ts";
import { assertEquals, assertRejects, SECOND, Tokens } from "../dev_deps.ts";
import { setTokensBySession } from "./core.ts";
import { oauth2Client } from "./test_utils.ts";

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
    await setTokensBySession(sessionId, tokens);
    assertEquals(
      await getSessionAccessToken(oauth2Client, sessionId),
      tokens.accessToken,
    );
  });

  await test.step("returns the access token for session with far expiry", async () => {
    const sessionId = crypto.randomUUID();
    const tokens: Tokens = {
      accessToken: crypto.randomUUID(),
      tokenType: "Bearer",
      expiresIn: Date.now() + (30 * SECOND),
      refreshToken: crypto.randomUUID(),
    };
    await setTokensBySession(sessionId, tokens);
    assertEquals(
      await getSessionAccessToken(oauth2Client, sessionId),
      tokens.accessToken,
    );
  });

  await test.step("rejects for an expired access token", async () => {
    const sessionId = crypto.randomUUID();
    const tokens: Tokens = {
      accessToken: crypto.randomUUID(),
      tokenType: "Bearer",
      expiresIn: 0,
      refreshToken: crypto.randomUUID(),
    };
    await setTokensBySession(sessionId, tokens);
    assertRejects(async () =>
      await getSessionAccessToken(oauth2Client, sessionId)
    );
  });

  await test.step("rejects if the OAuth provider hasn't issued the access token", async () => {
    const sessionId = crypto.randomUUID();
    const tokens: Tokens = {
      accessToken: crypto.randomUUID(),
      tokenType: "Bearer",
      expiresIn: 60,
      refreshToken: crypto.randomUUID(),
    };
    await setTokensBySession(sessionId, tokens);
    assertRejects(async () =>
      await getSessionAccessToken(oauth2Client, sessionId)
    );
  });
});
