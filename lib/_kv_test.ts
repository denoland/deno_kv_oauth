// Copyright 2023-2024 the Deno authors. All rights reserved. MIT license.
import { assertEquals, assertRejects } from "std/assert/mod.ts";
import {
  deleteSiteSession,
  getAndDeleteOAuthSession,
  getSiteSession,
  setOAuthSession,
  setSiteSession,
} from "./_kv.ts";
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

Deno.test("(get/set/delete)SiteSession()", async () => {
  const id = crypto.randomUUID();

  assertEquals(await getSiteSession(id), null);

  const siteSession = { foo: "bar" };
  await setSiteSession(id, siteSession);
  assertEquals(await getSiteSession(id), siteSession);

  await deleteSiteSession(id);
  assertEquals(await getSiteSession(id), null);
});
