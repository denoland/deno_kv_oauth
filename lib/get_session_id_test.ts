// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import { assertEquals } from "../dev_deps.ts";
import { SITE_COOKIE_NAME } from "./_http.ts";
import { getSessionId } from "./get_session_id.ts";

Deno.test("getSessionId() returns undefined when cookie is not defined", () => {
  const request = new Request("http://example.com");

  assertEquals(getSessionId(request), undefined);
});

Deno.test("getSessionId() returns valid session ID", () => {
  const sessionId = crypto.randomUUID();
  const request = new Request("http://example.com", {
    headers: {
      cookie: `${SITE_COOKIE_NAME}=${sessionId}`,
    },
  });

  assertEquals(getSessionId(request), sessionId);
});

Deno.test("getSessionId() returns valid session ID when cookie name is defined", () => {
  const sessionId = crypto.randomUUID();
  const cookieName = "triple-choc";
  const request = new Request("http://example.com", {
    headers: {
      cookie: `${cookieName}=${sessionId}`,
    },
  });

  assertEquals(getSessionId(request, { cookieName }), sessionId);
});
