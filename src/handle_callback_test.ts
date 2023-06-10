// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import { handleCallback } from "./handle_callback.ts";
import { assertRejects, OAuth2Client } from "../dev_deps.ts";
import {
  getOAuthSession,
  OAUTH_COOKIE_NAME,
  type OAuthSession,
  setOAuthSession,
} from "./_core.ts";
import { assertEquals } from "https://deno.land/std@0.190.0/testing/asserts.ts";

Deno.test("handleCallback()", async (test) => {
  const client = new OAuth2Client({
    clientId: crypto.randomUUID(),
    clientSecret: crypto.randomUUID(),
    authorizationEndpointUri: "https://example.com/authorize",
    tokenUri: "https://example.com/token",
  });

  await test.step("no oauth cookie", async () => {
    const request = new Request("http://example.com");
    await assertRejects(() => handleCallback(request, client));
  });

  await test.step("no oauth session", async () => {
    const request = new Request("http://example.com", {
      headers: { cookie: `${OAUTH_COOKIE_NAME}=xxx` },
    });
    await assertRejects(() => handleCallback(request, client));
  });

  await test.step("rejects at furthest point", async () => {
    const oauthSessionId = crypto.randomUUID();
    const oauthSession: OAuthSession = {
      state: crypto.randomUUID(),
      codeVerifier: crypto.randomUUID(),
    };
    await setOAuthSession(oauthSessionId, oauthSession);
    const request = new Request(
      "http://example.com/callback?code=xxx&state=xxx",
      {
        headers: { cookie: `${OAUTH_COOKIE_NAME}=${oauthSessionId}` },
      },
    );
    await assertRejects(async () => await handleCallback(request, client));
    assertEquals(await getOAuthSession(oauthSessionId), null);
  });
});
