// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import { getSessionAccessToken } from "./get_session_access_token.ts";
import { assertEquals, assertRejects, SECOND, Tokens } from "../dev_deps.ts";
import { SessionKey, setTokensBySession } from "./core.ts";
import { oauth2Client } from "./test_utils.ts";

Deno.test("getSessionAccessToken()", async (test) => {
  await test.step("returns null for non-existent session", async () => {
    assertEquals(await getSessionAccessToken(oauth2Client, [0, "nil"]), null);
  });

  await test.step("returns the access token for session without expiry", async () => {
    const sessionKey: SessionKey = [Date.now(), crypto.randomUUID()];
    const tokens: Tokens = {
      accessToken: crypto.randomUUID(),
      tokenType: "Bearer",
    };
    await setTokensBySession(sessionKey, tokens);
    assertEquals(
      await getSessionAccessToken(oauth2Client, sessionKey),
      tokens.accessToken,
    );
  });

  await test.step("returns the access token for session with far expiry", async () => {
    const expiresIn = 30;
    const sessionKey: SessionKey = [
      Date.now() + (expiresIn * SECOND),
      crypto.randomUUID(),
    ];
    const tokens: Tokens = {
      accessToken: crypto.randomUUID(),
      tokenType: "Bearer",
      expiresIn,
      refreshToken: crypto.randomUUID(),
    };
    await setTokensBySession(sessionKey, tokens);
    assertEquals(
      await getSessionAccessToken(oauth2Client, sessionKey),
      tokens.accessToken,
    );
  });

  await test.step("rejects for an expired access token", async () => {
    const sessionKey: SessionKey = [Date.now(), crypto.randomUUID()];
    const tokens: Tokens = {
      accessToken: crypto.randomUUID(),
      tokenType: "Bearer",
      expiresIn: 0,
      refreshToken: crypto.randomUUID(),
    };
    await setTokensBySession(sessionKey, tokens);
    assertRejects(async () =>
      await getSessionAccessToken(oauth2Client, sessionKey)
    );
  });

  await test.step("rejects if the OAuth provider hasn't issued the access token", async () => {
    const expiresIn = 60;
    const sessionKey: SessionKey = [
      Date.now() + (expiresIn * SECOND),
      crypto.randomUUID(),
    ];
    const tokens: Tokens = {
      accessToken: crypto.randomUUID(),
      tokenType: "Bearer",
      expiresIn,
      refreshToken: crypto.randomUUID(),
    };
    await setTokensBySession(sessionKey, tokens);
    assertRejects(async () =>
      await getSessionAccessToken(oauth2Client, sessionKey)
    );
  });
});
