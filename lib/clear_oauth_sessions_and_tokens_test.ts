// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import {
  getLegacyTokens,
  getOAuthSession,
  getTokens,
  setLegacyTokens,
  setOAuthSession,
  setTokens,
} from "./_core.ts";
import { clearOAuthSessionsAndTokens } from "./clear_oauth_sessions_and_tokens.ts";
import { assertEquals, assertNotEquals } from "../dev_deps.ts";
import { randomOAuthSession, randomTokens } from "./_test_utils.ts";

Deno.test("clearOAuthSessionsAndTokens()", async () => {
  const ids = Array.from({ length: 10 }).map(() => crypto.randomUUID());

  for (const id of ids) {
    await setOAuthSession(id, randomOAuthSession());
    assertNotEquals(await getOAuthSession(id), null);
    await setLegacyTokens(id, crypto.randomUUID());
    assertNotEquals(await getLegacyTokens(id), null);
    await setTokens(id, randomTokens());
    assertNotEquals(await getTokens(id), null);
  }

  await clearOAuthSessionsAndTokens();

  for (const id of ids) {
    assertEquals(await getOAuthSession(id), null);
    assertEquals(await getLegacyTokens(id), null);
    assertEquals(await getTokens(id), null);
  }
});
