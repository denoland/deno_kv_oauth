// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import { getSessionAccessToken } from "./get_session_access_token.ts";
import { assertEquals, assertRejects, type Tokens } from "../dev_deps.ts";
import { setTokens } from "./core.ts";
import { randomOAuthConfig, randomTokens } from "./test_utils.ts";

Deno.test("getSessionAccessToken()", async (test) => {
  await test.step("returns null for non-existent session", async () => {
    assertEquals(await getSessionAccessToken(randomOAuthConfig(), "nil"), null);
  });

  await test.step("returns the access token for session without refresh token", async () => {
    const sessionId = crypto.randomUUID();
    const tokens: Tokens = {
      ...randomTokens(),
      expiresIn: 3, // if we had a refresh token this would cause a refresh
    };
    await setTokens(sessionId, tokens);
    assertEquals(
      await getSessionAccessToken(randomOAuthConfig(), sessionId),
      tokens.accessToken,
    );
  });

  await test.step("returns the access token for session without expiry", async () => {
    const sessionId = crypto.randomUUID();
    const tokens: Tokens = {
      ...randomTokens(),
      refreshToken: crypto.randomUUID(),
    };
    await setTokens(sessionId, tokens);
    assertEquals(
      await getSessionAccessToken(randomOAuthConfig(), sessionId),
      tokens.accessToken,
    );
  });

  await test.step("returns the access token for session with far expiry", async () => {
    const sessionId = crypto.randomUUID();
    const tokens: Tokens = {
      ...randomTokens(),
      refreshToken: crypto.randomUUID(),
      expiresIn: 30,
    };
    await setTokens(sessionId, tokens);
    assertEquals(
      await getSessionAccessToken(randomOAuthConfig(), sessionId),
      tokens.accessToken,
    );
  });

  await test.step("rejects for an access token which expires in less than 5 seconds", async () => {
    const sessionId = crypto.randomUUID();
    const tokens: Tokens = {
      ...randomTokens(),
      refreshToken: crypto.randomUUID(),
      expiresIn: 3,
    };
    await setTokens(sessionId, tokens);
    await assertRejects(async () =>
      await getSessionAccessToken(randomOAuthConfig(), sessionId)
    );
  });

  await test.step("rejects for an expired access token", async () => {
    const sessionId = crypto.randomUUID();
    const tokens: Tokens = {
      ...randomTokens(),
      refreshToken: crypto.randomUUID(),
      expiresIn: 0,
    };
    await setTokens(sessionId, tokens);
    await assertRejects(async () =>
      await getSessionAccessToken(randomOAuthConfig(), sessionId)
    );
  });
});
