// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import { getSessionAccessToken } from "./get_session_access_token.ts";
import { assertEquals, assertRejects, Tokens } from "../dev_deps.ts";
import { setTokens } from "./core.ts";

Deno.test("getSessionAccessToken()", async (test) => {
  await test.step("returns null for non-existent session", async () => {
    assertEquals(await getSessionAccessToken("nil"), null);
  });

  await test.step("returns the access token for session without expiry", async () => {
    const sessionId = crypto.randomUUID();
    const tokens: Tokens = {
      accessToken: crypto.randomUUID(),
      tokenType: "Bearer",
    };
    await setTokens(sessionId, tokens);
    assertEquals(
      await getSessionAccessToken(sessionId),
      tokens.accessToken,
    );
  });

  await test.step("returns null for an expired access token", async () => {
    const sessionId = crypto.randomUUID();
    const tokens: Tokens = {
      accessToken: crypto.randomUUID(),
      tokenType: "Bearer",
      expiresIn: 0,
      refreshToken: crypto.randomUUID(),
    };
    await setTokens(sessionId, tokens);
    assertRejects(async () => await getSessionAccessToken(sessionId));
  });
});
