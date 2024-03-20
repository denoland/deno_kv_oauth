// Copyright 2023-2024 the Deno authors. All rights reserved. MIT license.
import { createHelpers } from "./create_helpers.ts";
import {
  assert,
  assertEquals,
  assertNotEquals,
  assertRejects,
} from "std/assert/mod.ts";
import { returnsNext, stub } from "std/testing/mock.ts";
import {
  getAndDeleteOAuthSession,
  setOAuthSession,
  setSiteSession,
} from "./_kv.ts";
import { OAUTH_COOKIE_NAME, SITE_COOKIE_NAME } from "./_http.ts";
import {
  assertRedirect,
  randomOAuthConfig,
  randomOAuthSession,
  randomTokensBody,
} from "./_test_utils.ts";
import { type Cookie, getSetCookies } from "../deps.ts";

Deno.test("signIn() returns a response that signs-in the user", async () => {
  const { signIn } = createHelpers(randomOAuthConfig());
  const request = new Request("http://example.com/signin");
  const response = await signIn(request);
  assertRedirect(response);

  const [setCookie] = getSetCookies(response.headers);
  assert(setCookie !== undefined);
  assertEquals(setCookie.name, OAUTH_COOKIE_NAME);
  assertEquals(setCookie.httpOnly, true);
  assertEquals(setCookie.maxAge, 10 * 60);
  assertEquals(setCookie.sameSite, "Lax");
  assertEquals(setCookie.path, "/");

  const oauthSessionId = setCookie.value;
  const oauthSession = await getAndDeleteOAuthSession(oauthSessionId);
  assertNotEquals(oauthSession, null);
  const location = response.headers.get("location")!;
  const state = new URL(location).searchParams.get("state");
  assertEquals(oauthSession!.state, state);
});

Deno.test("signIn() returns a redirect response with URL params", async () => {
  const { signIn } = createHelpers(randomOAuthConfig());
  const request = new Request("http://example.com/signin");
  const response = await signIn(request, {
    urlParams: { foo: "bar" },
  });
  assertRedirect(response);
  const location = response.headers.get("location")!;
  assertEquals(new URL(location).searchParams.get("foo"), "bar");
});

Deno.test("handleCallback() rejects for no OAuth cookie", async () => {
  const { handleCallback } = createHelpers(randomOAuthConfig());
  const request = new Request("http://example.com");
  await assertRejects(
    async () => await handleCallback(request),
    Error,
    "OAuth cookie not found",
  );
});

Deno.test("handleCallback() rejects for non-existent OAuth session", async () => {
  const { handleCallback } = createHelpers(randomOAuthConfig());
  const request = new Request("http://example.com", {
    headers: { cookie: `${OAUTH_COOKIE_NAME}=xxx` },
  });
  await assertRejects(
    async () => await handleCallback(request),
    Deno.errors.NotFound,
    "OAuth session not found",
  );
});

Deno.test("handleCallback() deletes the OAuth session KV entry", async () => {
  const { handleCallback } = createHelpers(randomOAuthConfig());
  const oauthSessionId = crypto.randomUUID();
  const oauthSession = randomOAuthSession();
  await setOAuthSession(oauthSessionId, oauthSession, { expireIn: 1_000 });
  const request = new Request("http://example.com", {
    headers: { cookie: `${OAUTH_COOKIE_NAME}=${oauthSessionId}` },
  });
  await assertRejects(() => handleCallback(request));
  await assertRejects(
    async () => await getAndDeleteOAuthSession(oauthSessionId),
    Deno.errors.NotFound,
    "OAuth session not found",
  );
});

Deno.test("handleCallback() correctly handles the callback response", async () => {
  const { handleCallback } = createHelpers(randomOAuthConfig());
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
  const { response, tokens, sessionId } = await handleCallback(request);
  fetchStub.restore();

  assertRedirect(response, oauthSession.successUrl);
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
  const { handleCallback } = createHelpers(randomOAuthConfig(), {
    cookieOptions,
  });
  const { response, tokens, sessionId } = await handleCallback(request);
  fetchStub.restore();

  assertRedirect(response, oauthSession.successUrl);
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

Deno.test("getSessionId() returns undefined when cookie is not defined", async () => {
  const { getSessionId } = createHelpers(randomOAuthConfig());
  const request = new Request("http://example.com");

  assertEquals(await getSessionId(request), undefined);
});

Deno.test("getSessionId() returns valid session ID", async () => {
  const { getSessionId } = createHelpers(randomOAuthConfig());
  const sessionId = crypto.randomUUID();
  await setSiteSession(sessionId);
  const request = new Request("http://example.com", {
    headers: {
      cookie: `${SITE_COOKIE_NAME}=${sessionId}`,
    },
  });

  assertEquals(await getSessionId(request), sessionId);
});

Deno.test("getSessionId() returns valid session ID when cookie name is defined", async () => {
  const sessionId = crypto.randomUUID();
  await setSiteSession(sessionId);
  const name = "triple-choc";
  const { getSessionId } = createHelpers(randomOAuthConfig(), {
    cookieOptions: { name },
  });
  const request = new Request("http://example.com", {
    headers: {
      cookie: `${name}=${sessionId}`,
    },
  });

  assertEquals(await getSessionId(request), sessionId);
});

Deno.test("signOut() returns a redirect response if the user is not signed-in", async () => {
  const { signOut } = createHelpers(randomOAuthConfig());
  const request = new Request("http://example.com/signout");
  const response = await signOut(request);

  assertRedirect(response, "/");
});

Deno.test("signOut() returns a response that signs out the signed-in user", async () => {
  const { signOut } = createHelpers(randomOAuthConfig());
  const sessionId = crypto.randomUUID();
  await setSiteSession(sessionId);
  const request = new Request("http://example.com/signout", {
    headers: {
      cookie: `${SITE_COOKIE_NAME}=${sessionId}`,
    },
  });
  const response = await signOut(request);

  assertRedirect(response, "/");
  assertEquals(
    response.headers.get("set-cookie"),
    `${SITE_COOKIE_NAME}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT`,
  );
});

Deno.test("signOut() returns a response that signs out the signed-in user with cookie options", async () => {
  const cookieOptions = {
    name: "triple-choc",
    domain: "example.com",
    path: "/path",
  };
  const { signOut } = createHelpers(randomOAuthConfig(), { cookieOptions });
  const sessionId = crypto.randomUUID();
  await setSiteSession(sessionId);
  const request = new Request("http://example.com/signout", {
    headers: {
      cookie: `${cookieOptions.name}=${sessionId}`,
    },
  });
  const response = await signOut(request);

  assertRedirect(response, "/");
  assertEquals(
    response.headers.get("set-cookie"),
    `${cookieOptions.name}=; Domain=${cookieOptions.domain}; Path=${cookieOptions.path}; Expires=Thu, 01 Jan 1970 00:00:00 GMT`,
  );
});
