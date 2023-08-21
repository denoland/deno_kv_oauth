// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import {
  getOAuthSession,
  getTokens,
  setOAuthSession,
  setTokens,
} from "./core.ts";
import { clearOAuthSessionsAndTokens } from "./clear_oauth_sessions_and_tokens.ts";
import { assertEquals, assertNotEquals } from "../dev_deps.ts";

Deno.test("clearOAuthSessionsAndTokens()", async () => {
  const ids = Array.from({ length: 10 }).map(() => crypto.randomUUID());

  for (const id of ids) {
    await setOAuthSession(id, {
      state: crypto.randomUUID(),
      codeVerifier: crypto.randomUUID(),
    });
    assertNotEquals(await getOAuthSession(id), null);
    await setTokens(id, {
      accessToken: crypto.randomUUID(),
      tokenType: crypto.randomUUID(),
    });
    assertNotEquals(await getTokens(id), null);
  }

  await clearOAuthSessionsAndTokens();

  for (const id of ids) {
    assertEquals(await getOAuthSession(id), null);
    assertEquals(await getTokens(id), null);
  }
});
