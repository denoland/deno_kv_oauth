// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import {
  getLegacyTokens1,
  getLegacyTokens2,
  getOAuthSession,
  setLegacyTokens1,
  setLegacyTokens2,
  setOAuthSession,
} from "./_core.ts";
import { clearOAuthSessionsAndTokens } from "./clear_oauth_sessions_and_tokens.ts";
import { assertEquals, assertNotEquals } from "../dev_deps.ts";
import { randomOAuthSession } from "./_test_utils.ts";

Deno.test("clearOAuthSessionsAndTokens()", async () => {
  const ids = Array.from({ length: 10 }).map(() => crypto.randomUUID());

  for (const id of ids) {
    await setOAuthSession(id, randomOAuthSession());
    assertNotEquals(await getOAuthSession(id), null);
    await setLegacyTokens1(id, crypto.randomUUID());
    assertNotEquals(await getLegacyTokens1(id), null);
    await setLegacyTokens2(id, crypto.randomUUID());
    assertNotEquals(await getLegacyTokens2(id), null);
  }

  await clearOAuthSessionsAndTokens();

  for (const id of ids) {
    assertEquals(await getOAuthSession(id), null);
    assertEquals(await getLegacyTokens1(id), null);
    assertEquals(await getLegacyTokens2(id), null);
  }
});
