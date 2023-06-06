// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import { assertEquals, assertNotEquals } from "../deps.ts";
import { SITE_COOKIE_NAME } from "./_core.ts";
import { getSessionId } from "./get_session_id.ts";

Deno.test("getSessionId()", () => {
  const insecureRequest = new Request("http://example.com");
  assertEquals(getSessionId(insecureRequest), null);

  insecureRequest.headers.set("cookie", "not-site-session=xxx");
  assertEquals(getSessionId(insecureRequest), null);

  insecureRequest.headers.set("cookie", `${SITE_COOKIE_NAME}=xxx`);
  assertNotEquals(getSessionId(insecureRequest), null);

  const secureRequest = new Request("https://example.com");
  assertEquals(getSessionId(secureRequest), null);

  secureRequest.headers.set("cookie", "not-site-session=xxx");
  assertEquals(getSessionId(secureRequest), null);

  secureRequest.headers.set("cookie", `__Host-${SITE_COOKIE_NAME}=xxx`);
  assertNotEquals(getSessionId(secureRequest), null);
});
