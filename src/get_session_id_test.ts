// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import { assertEquals } from "../dev_deps.ts";
import { SITE_COOKIE_NAME } from "./core.ts";
import { getSessionId } from "./get_session_id.ts";

Deno.test("getSessionId()", async (test) => {
  await test.step("returns undefined when cookie is not defined", () => {
    const request = new Request("http://example.com");
    assertEquals(getSessionId(request), undefined);
  });

  await test.step("returns valid session ID", () => {
    const sessionId = crypto.randomUUID();
    const request = new Request("http://example.com", {
      headers: {
        cookie: `${SITE_COOKIE_NAME}=${sessionId}`,
      },
    });
    assertEquals(getSessionId(request), sessionId);
  });
});
