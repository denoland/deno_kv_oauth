// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import {
  getOAuthSession,
  getTokensBySession,
  setOAuthSession,
  setTokensBySession,
} from "./core.ts";
import { cleanupExpiredEntries } from "./cleanup_expired_entries.ts";
import { assertEquals, assertNotEquals, SECOND } from "../dev_deps.ts";
import { genOAuthSession, genSessionKey, genTokens } from "./test_utils.ts";

Deno.test("cleanupExpiredEntries()", async () => {
  const expiredOAuthSessionKey = genSessionKey(-10 * SECOND);
  const expiredTokensKey = genSessionKey(-10 * SECOND);
  const validOAuthSessionKey = genSessionKey(10 * SECOND);
  const validTokensKey = genSessionKey(10 * SECOND);

  await setOAuthSession(expiredOAuthSessionKey, genOAuthSession());
  await setTokensBySession(expiredTokensKey, genTokens());
  await setOAuthSession(validOAuthSessionKey, genOAuthSession());
  await setTokensBySession(validTokensKey, genTokens());

  assertNotEquals(await getOAuthSession(expiredOAuthSessionKey), null);
  assertNotEquals(await getTokensBySession(expiredTokensKey), null);
  assertNotEquals(await getOAuthSession(validOAuthSessionKey), null);
  assertNotEquals(await getTokensBySession(validTokensKey), null);

  await cleanupExpiredEntries();

  assertEquals(await getOAuthSession(expiredOAuthSessionKey), null);
  assertEquals(await getTokensBySession(expiredTokensKey), null);
  assertNotEquals(await getOAuthSession(validOAuthSessionKey), null);
  assertNotEquals(await getTokensBySession(validTokensKey), null);
});
