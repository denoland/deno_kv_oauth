// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import { assertEquals, type Tokens } from "../deps.ts";
import { getSessionTokens } from "./get_session_tokens.ts";
import {
  deleteTokensBySiteSession,
  setTokensBySiteSession,
  SITE_COOKIE_NAME,
} from "./_core.ts";

Deno.test("getSessionTokens()", async (test) => {
  await test.step("signed out with insecure origin", async () => {
    const request = new Request("http://example.com");
    assertEquals(await getSessionTokens(request), null);
  });

  await test.step("signed out with insecure origin", async () => {
    const request = new Request("https://example.com");
    assertEquals(await getSessionTokens(request), null);
  });

  await test.step("signed in with insecure origin", async () => {
    const siteSessionId = crypto.randomUUID();
    const tokens: Tokens = {
      accessToken: crypto.randomUUID(),
      tokenType: crypto.randomUUID(),
    };
    await setTokensBySiteSession(siteSessionId, tokens);
    const request = new Request("http://example.com", {
      headers: {
        cookie: `${SITE_COOKIE_NAME}=${siteSessionId}`,
      },
    });

    assertEquals(await getSessionTokens(request), tokens);

    // Cleanup
    await deleteTokensBySiteSession(siteSessionId);
  });

  await test.step("signed in with secure origin", async () => {
    const siteSessionId = crypto.randomUUID();
    const tokens: Tokens = {
      accessToken: crypto.randomUUID(),
      tokenType: crypto.randomUUID(),
    };
    await setTokensBySiteSession(siteSessionId, tokens);
    const request = new Request("https://example.com", {
      headers: {
        cookie: `__Host-${SITE_COOKIE_NAME}=${siteSessionId}`,
      },
    });

    assertEquals(await getSessionTokens(request), tokens);

    // Cleanup
    await deleteTokensBySiteSession(siteSessionId);
  });
});
