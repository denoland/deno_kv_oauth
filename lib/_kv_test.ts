// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import { assertEquals, assertRejects } from "../dev_deps.ts";
import { getAndDeleteOAuthSession, setOAuthSession } from "./_kv.ts";
import { randomOAuthSession } from "./_test_utils.ts";

Deno.test("(getAndDelete/set)OAuthSession()", async () => {
  const id = crypto.randomUUID();

  // OAuth session doesn't yet exist
  await assertRejects(
    async () => await getAndDeleteOAuthSession(id),
    Deno.errors.NotFound,
    "OAuth session not found",
  );

  const oauthSession = randomOAuthSession();
  await setOAuthSession(id, oauthSession, { expireIn: 1_000 });
  assertEquals(await getAndDeleteOAuthSession(id), oauthSession);
  await assertRejects(
    async () => await getAndDeleteOAuthSession(id),
    Deno.errors.NotFound,
    "OAuth session not found",
  );
});
