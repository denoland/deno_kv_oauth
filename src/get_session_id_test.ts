// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import { assertEquals } from "../dev_deps.ts";
import { setTokensBySession, SITE_COOKIE_NAME } from "./core.ts";
import { getSessionId } from "./get_session_id.ts";

Deno.test("getSessionId()", async (test) => {
  await test.step("returns null for invalid cookie", async () => {
    const request = new Request("http://example.com");
    assertEquals(await getSessionId(request), undefined);
  });

  await test.step("returns null for non-existent session ID", async () => {
    const request = new Request("http://example.com", {
      headers: {
        cookie: `${SITE_COOKIE_NAME}=nil`,
      },
    });
    assertEquals(await getSessionId(request), undefined);
  });

  await test.step("returns valid session ID", async () => {
    const sessionId = crypto.randomUUID();
    await setTokensBySession(sessionId, {
      accessToken: crypto.randomUUID(),
      tokenType: crypto.randomUUID(),
    });
    const request = new Request("http://example.com", {
      headers: {
        cookie: `${SITE_COOKIE_NAME}=${sessionId}`,
      },
    });
    assertEquals(await getSessionId(request), sessionId);
  });
});
