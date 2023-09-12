// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import { getSessionAccessToken } from "./get_session_access_token.ts";
import { assertEquals, assertRejects, SECOND } from "../dev_deps.ts";
import { setTokens } from "./core.ts";
import { genTokens, oauthConfig } from "./test_utils.ts";
import type { Tokens } from "./types.ts";

Deno.test("getSessionAccessToken()", async (test) => {
  await test.step("returns null for non-existent session", async () => {
    assertEquals(await getSessionAccessToken(oauthConfig, "nil"), null);
  });

  await test.step("returns the access token for session without expiry", async () => {
    const sessionId = crypto.randomUUID();
    const tokens = genTokens();
    await setTokens(sessionId, tokens);
    assertEquals(
      await getSessionAccessToken(oauthConfig, sessionId),
      tokens.accessToken,
    );
  });

  await test.step("returns the access token for session with far expiry", async () => {
    const sessionId = crypto.randomUUID();
    const tokens: Tokens = {
      ...genTokens(),
      expiresIn: Date.now() + (30 * SECOND),
    };
    await setTokens(sessionId, tokens);
    assertEquals(
      await getSessionAccessToken(oauthConfig, sessionId),
      tokens.accessToken,
    );
  });

  await test.step("rejects for an expired access token", async () => {
    const sessionId = crypto.randomUUID();
    const tokens: Tokens = {
      ...genTokens(),
      expiresIn: 0,
    };
    await setTokens(sessionId, tokens);
    assertRejects(async () =>
      await getSessionAccessToken(oauthConfig, sessionId)
    );
  });

  await test.step("rejects if the OAuth provider hasn't issued the access token", async () => {
    const sessionId = crypto.randomUUID();
    const tokens: Tokens = {
      ...genTokens(),
      expiresIn: 60,
    };
    await setTokens(sessionId, tokens);
    assertRejects(async () =>
      await getSessionAccessToken(oauthConfig, sessionId)
    );
  });
});
