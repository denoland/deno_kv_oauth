// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import { handleCallback } from "./handle_callback.ts";
import { assertEquals, assertRejects, returnsNext, stub } from "../dev_deps.ts";
import { getAndDeleteOAuthSession, setOAuthSession } from "./_kv.ts";
import { OAUTH_COOKIE_NAME } from "./_http.ts";
import {
  assertRedirect,
  randomOAuthConfig,
  randomOAuthSession,
  randomTokensBody,
} from "./_test_utils.ts";
import { Cookie } from "https://deno.land/x/deno_kv_oauth@$VERSION/deps.ts";

Deno.test("handleCallback() rejects for no OAuth cookie", async () => {
  const request = new Request("http://example.com");
  await assertRejects(
    async () => await handleCallback(request, randomOAuthConfig()),
    Error,
    "OAuth cookie not found",
  );
});

Deno.test("handleCallback() rejects for non-existent OAuth session", async () => {
  const request = new Request("http://example.com", {
    headers: { cookie: `${OAUTH_COOKIE_NAME}=xxx` },
  });
  await assertRejects(
    async () => await handleCallback(request, randomOAuthConfig()),
    Deno.errors.NotFound,
    "OAuth session not found",
  );
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
  const tokensBody = randomTokensBody();
  const fetchStub = stub(
    window,
    "fetch",
    returnsNext([Promise.resolve(Response.json(tokensBody))]),
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
  const { response, tokens, sessionId } = await handleCallback(
    request,
    randomOAuthConfig(),
  );
  fetchStub.restore();

  assertRedirect(response);
  assertEquals(
    response.headers.get("set-cookie"),
    `site-session=${sessionId}; HttpOnly; Max-Age=7776000; SameSite=Lax; Path=/`,
  );
  assertEquals(tokens.accessToken, tokensBody.access_token);
  assertEquals(typeof sessionId, "string");
  await assertRejects(
    async () => await getAndDeleteOAuthSession(oauthSessionId),
    Deno.errors.NotFound,
    "OAuth session not found",
  );
});

Deno.test("handleCallback() correctly handles the callback response with options", async () => {
  const tokensBody = randomTokensBody();
  const fetchStub = stub(
    window,
    "fetch",
    returnsNext([Promise.resolve(Response.json(tokensBody))]),
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
  const cookieOptions: Partial<Cookie> = {
    name: "triple-choc",
    maxAge: 420,
    domain: "example.com",
  };
  const { response, tokens, sessionId } = await handleCallback(
    request,
    randomOAuthConfig(),
    { cookieOptions },
  );
  fetchStub.restore();

  assertRedirect(response);
  assertEquals(
    response.headers.get("set-cookie"),
    `${cookieOptions.name}=${sessionId}; HttpOnly; Max-Age=${cookieOptions.maxAge}; Domain=${cookieOptions.domain}; SameSite=Lax; Path=/`,
  );
  assertEquals(tokens.accessToken, tokensBody.access_token);
  assertEquals(typeof sessionId, "string");
  await assertRejects(
    async () => await getAndDeleteOAuthSession(oauthSessionId),
    Deno.errors.NotFound,
    "OAuth session not found",
  );
});
