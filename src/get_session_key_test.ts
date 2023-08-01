// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import { assertEquals } from "../dev_deps.ts";
import {
  SessionKey,
  SITE_COOKIE_NAME,
  stringifySessionKeyCookie,
} from "./core.ts";
import { getSessionKey } from "./get_session_key.ts";

Deno.test("getSessionKey()", async (test) => {
  await test.step("returns undefined when cookie is not defined", () => {
    const request = new Request("http://example.com");
    assertEquals(getSessionKey(request), undefined);
  });

  await test.step("returns valid session key", () => {
    const sessionKey: SessionKey = [Date.now(), crypto.randomUUID()];
    const request = new Request("http://example.com", {
      headers: {
        cookie: `${SITE_COOKIE_NAME}=${stringifySessionKeyCookie(sessionKey)}`,
      },
    });
    assertEquals(getSessionKey(request), sessionKey);
  });
});
