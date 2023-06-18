// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import { handleCallback } from "./handle_callback.ts";
import { assertEquals, assertRejects } from "../dev_deps.ts";
import {
  getOAuthSession,
  OAUTH_COOKIE_NAME,
  OAuthSession,
  setOAuthSession,
} from "./core.ts";
import { oauth2Client } from "./test_utils.ts";

Deno.test("handleCallback()", async (test) => {
  await test.step("rejects for no OAuth 2.0 cookie", async () => {
    const request = new Request("http://example.com");
    await assertRejects(() => handleCallback(request, oauth2Client));
  });

  await test.step("rejects for non-existent OAuth 2.0 session", async () => {
    const request = new Request("http://example.com", {
      headers: { cookie: `${OAUTH_COOKIE_NAME}=xxx` },
    });
    await assertRejects(() => handleCallback(request, oauth2Client));
  });

  await test.step("deletes the OAuth 2.0 session KV entry", async () => {
    const oauthSessionId = crypto.randomUUID();
    const oauthSession: OAuthSession = {
      state: crypto.randomUUID(),
      codeVerifier: crypto.randomUUID(),
    };
    await setOAuthSession(oauthSessionId, oauthSession);
    const request = new Request("http://example.com", {
      headers: { cookie: `${OAUTH_COOKIE_NAME}=${oauthSessionId}` },
    });
    await assertRejects(() => handleCallback(request, oauth2Client));
    await assertEquals(await getOAuthSession(oauthSessionId), null);
  });
});
