// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import { handleCallback } from "./handle_callback.ts";
import { assertEquals, assertRejects, returnsNext, stub } from "../dev_deps.ts";
import {
  getAndDeleteOAuthSession,
  OAUTH_COOKIE_NAME,
  setOAuthSession,
} from "./_core.ts";
import {
  assertRedirect,
  randomOAuthConfig,
  randomOAuthSession,
} from "./_test_utils.ts";

Deno.test("handleCallback() rejects for no OAuth cookie", async () => {
  const request = new Request("http://example.com");
  await assertRejects(() => handleCallback(request, randomOAuthConfig()));
});

Deno.test("handleCallback() rejects for non-existent OAuth session", async () => {
  const request = new Request("http://example.com", {
    headers: { cookie: `${OAUTH_COOKIE_NAME}=xxx` },
  });
  await assertRejects(() => handleCallback(request, randomOAuthConfig()));
});

Deno.test("handleCallback() deletes the OAuth session KV entry", async () => {
  const oauthSessionId = crypto.randomUUID();
  const oauthSession = randomOAuthSession();
  await setOAuthSession(oauthSessionId, oauthSession);
  const request = new Request("http://example.com", {
    headers: { cookie: `${OAUTH_COOKIE_NAME}=${oauthSessionId}` },
  });
  await assertRejects(() => handleCallback(request, randomOAuthConfig()));
  await assertRejects(
    async () => await getAndDeleteOAuthSession(oauthSessionId),
    Deno.errors.NotFound,
    "OAuth session not found",
  );
});

Deno.test("handleCallback() correctly handles the callback response", async () => {
  const newAccessToken = crypto.randomUUID();
  const fetchStub = stub(
    window,
    "fetch",
    returnsNext([Promise.resolve(Response.json({
      access_token: newAccessToken,
      token_type: crypto.randomUUID(),
    }))]),
  );

  const oauthSessionId = crypto.randomUUID();
  const oauthSession = randomOAuthSession();
  await setOAuthSession(oauthSessionId, oauthSession);
  const searchParams = new URLSearchParams({
    "response_type": "code",
    "client_id": "clientId",
    "code_challenge_method": "S256",
    code: "code",
    state: oauthSession.state,
  });
  const request = new Request(`http://example.com/callback?${searchParams}`, {
    headers: { cookie: `${OAUTH_COOKIE_NAME}=${oauthSessionId}` },
  });
  const { response, accessToken, sessionId } = await handleCallback(
    request,
    randomOAuthConfig(),
  );

  fetchStub.restore();

  assertRedirect(response);
  assertEquals(accessToken, newAccessToken);
  assertEquals(typeof sessionId, "string");
  await assertRejects(
    async () => await getAndDeleteOAuthSession(oauthSessionId),
    Deno.errors.NotFound,
    "OAuth session not found",
  );
});
