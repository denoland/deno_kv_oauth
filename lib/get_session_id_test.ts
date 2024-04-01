// Copyright 2023-2024 the Deno authors. All rights reserved. MIT license.
import { assertEquals } from "@std/assert";
import { SITE_COOKIE_NAME } from "./_http.ts";
import { getSessionId } from "./get_session_id.ts";
import { setSiteSession } from "./_kv.ts";

Deno.test("getSessionId() returns undefined when cookie is not defined", async () => {
  const request = new Request("http://example.com");

  assertEquals(await getSessionId(request), undefined);
});

Deno.test("getSessionId() returns valid session ID", async () => {
  const sessionId = crypto.randomUUID();
  await setSiteSession(sessionId);
  const request = new Request("http://example.com", {
    headers: {
      cookie: `${SITE_COOKIE_NAME}=${sessionId}`,
    },
  });

  assertEquals(await getSessionId(request), sessionId);
});

Deno.test("getSessionId() returns valid session ID when cookie name is defined", async () => {
  const sessionId = crypto.randomUUID();
  await setSiteSession(sessionId);
  const cookieName = "triple-choc";
  const request = new Request("http://example.com", {
    headers: {
      cookie: `${cookieName}=${sessionId}`,
    },
  });

  assertEquals(await getSessionId(request, { cookieName }), sessionId);
});
