// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import {
  getOAuthSession,
  getTokensBySession,
  setOAuthSession,
  setTokensBySession,
} from "./core.ts";
import { cleanKv } from "./clean_kv.ts";
import { assertEquals, assertNotEquals, SECOND, ulid } from "../dev_deps.ts";
import { genOAuthSession, genTokens } from "./test_utils.ts";

Deno.test("cleanupExpiredEntries()", async () => {
  const now = Date.now();
  const expiredOAuthSessionKey = ulid(now - (10 * SECOND));
  const expiredTokensKey = ulid(now - (10 * SECOND));
  const validOAuthSessionKey = ulid(now + (10 * SECOND));
  const validTokensKey = ulid(now + (10 * SECOND));

  await setOAuthSession(expiredOAuthSessionKey, genOAuthSession());
  await setTokensBySession(expiredTokensKey, genTokens());
  await setOAuthSession(validOAuthSessionKey, genOAuthSession());
  await setTokensBySession(validTokensKey, genTokens());

  assertNotEquals(await getOAuthSession(expiredOAuthSessionKey), null);
  assertNotEquals(await getTokensBySession(expiredTokensKey), null);
  assertNotEquals(await getOAuthSession(validOAuthSessionKey), null);
  assertNotEquals(await getTokensBySession(validTokensKey), null);

  await cleanKv();

  assertEquals(await getOAuthSession(expiredOAuthSessionKey), null);
  assertEquals(await getTokensBySession(expiredTokensKey), null);
  assertNotEquals(await getOAuthSession(validOAuthSessionKey), null);
  assertNotEquals(await getTokensBySession(validTokensKey), null);
});
