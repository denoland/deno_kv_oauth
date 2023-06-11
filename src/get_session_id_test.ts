// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import { assertEquals } from "../dev_deps.ts";
import { SITE_COOKIE_NAME } from "./_core.ts";
import { getSessionId } from "./get_session_id.ts";

Deno.test("await getSessionId()", async () => {
  const insecureRequest = new Request("http://example.com");
  assertEquals(await getSessionId(insecureRequest), null);

  insecureRequest.headers.set("cookie", "not-site-session=xxx");
  assertEquals(await getSessionId(insecureRequest), null);

  insecureRequest.headers.set("cookie", `${SITE_COOKIE_NAME}=xxx`);
  assertEquals(await getSessionId(insecureRequest), null);

  const secureRequest = new Request("https://example.com");
  assertEquals(await getSessionId(secureRequest), null);

  secureRequest.headers.set("cookie", "not-site-session=xxx");
  assertEquals(await getSessionId(secureRequest), null);

  secureRequest.headers.set("cookie", `__Host-${SITE_COOKIE_NAME}=xxx`);
  assertEquals(await getSessionId(secureRequest), null);
});
