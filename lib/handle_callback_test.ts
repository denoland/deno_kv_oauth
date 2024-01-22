// Copyright 2023-2024 the Deno authors. All rights reserved. MIT license.
import { handleCallback } from "./handle_callback.ts";
import {
  assert,
  assertEquals,
  assertNotEquals,
  assertRejects,
} from "std/assert/mod.ts";
import { getSetCookies } from "std/http/cookie.ts";
import { returnsNext, stub } from "std/testing/mock.ts";
import { getAndDeleteOAuthSession, setOAuthSession } from "./_kv.ts";
import { OAUTH_COOKIE_NAME } from "./_http.ts";
import {
  assertRedirect,
  randomOAuthConfig,
  randomOAuthSession,
  randomTokensBody,
} from "./_test_utils.ts";
import type { Cookie } from "../deps.ts";

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
  await setOAuthSession(oauthSessionId, oauthSession, { expireIn: 1_000 });
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
  await setOAuthSession(oauthSessionId, oauthSession, { expireIn: 1_000 });
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
  const response = await handleCallback(
    request,
    randomOAuthConfig(),
  );
  fetchStub.restore();

  assertRedirect(response, oauthSession.successUrl);
  const [cookie] = getSetCookies(response.headers);
  assert(cookie !== undefined);
  assertEquals(cookie.name, "site-session");
  assertEquals(cookie.maxAge, 7776000);
  assertEquals(cookie.sameSite, "Lax");
  assertEquals(cookie.path, "/");

  const sessionId = cookie.value;
  assertNotEquals(sessionId, undefined);
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
  await setOAuthSession(oauthSessionId, oauthSession, { expireIn: 1_000 });
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
  const response = await handleCallback(
    request,
    randomOAuthConfig(),
    { cookieOptions },
  );
  fetchStub.restore();

  assertRedirect(response, oauthSession.successUrl);
  const [cookie] = getSetCookies(response.headers);
  assert(cookie !== undefined);
  assertEquals(cookie.name, cookieOptions.name);
  assertEquals(cookie.maxAge, cookieOptions.maxAge);
  assertEquals(cookie.domain, cookieOptions.domain);
  assertEquals(cookie.sameSite, "Lax");
  assertEquals(cookie.path, "/");

  const sessionId = cookie.value;
  assertNotEquals(sessionId, undefined);
  await assertRejects(
    async () => await getAndDeleteOAuthSession(oauthSessionId),
    Deno.errors.NotFound,
    "OAuth session not found",
  );
});
