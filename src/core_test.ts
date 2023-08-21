// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import { assert, assertEquals, Status, type Tokens } from "../dev_deps.ts";
import {
  deleteOAuthSession,
  deleteTokens,
  getCookieName,
  getOAuthSession,
  getTokens,
  isSecure,
  type OAuthSession,
  redirect,
  setOAuthSession,
  setTokens,
} from "./core.ts";

Deno.test("isSecure() works correctly", () => {
  assertEquals(isSecure("https://example.com"), true);
  assertEquals(isSecure("http://example.com"), false);
});

Deno.test("getCookieName() works correctly", () => {
  assertEquals(getCookieName("hello", true), "__Host-hello");
  assertEquals(getCookieName("hello", false), "hello");
});

Deno.test("(get/set/delete)OAuthSession() work interchangeably", async () => {
  const id = crypto.randomUUID();

  // OAuth 2.0 session doesn't yet exist
  assertEquals(await getOAuthSession(id), null);

  const oauthSession: OAuthSession = {
    state: crypto.randomUUID(),
    codeVerifier: crypto.randomUUID(),
  };
  await setOAuthSession(id, oauthSession);

  assertEquals(await getOAuthSession(id), oauthSession);

  await deleteOAuthSession(id);

  assertEquals(await getOAuthSession(id), null);
});

Deno.test("(get/set/delete)Tokens() work interchangeably", async () => {
  const sessionId = crypto.randomUUID();

  // Tokens don't yet exist
  assertEquals(await getTokens(sessionId), null);

  const tokens: Tokens = {
    accessToken: crypto.randomUUID(),
    tokenType: crypto.randomUUID(),
  };
  await setTokens(sessionId, tokens);

  assertEquals(await getTokens(sessionId), tokens);

  await deleteTokens(sessionId);

  assertEquals(await getTokens(sessionId), null);
});

Deno.test("redirect() returns a redirect response", () => {
  const location = "/hello-there";

  const response = redirect(location);
  assert(!response.ok);
  assertEquals(response.body, null);
  assertEquals(response.headers.get("location"), location);
  assertEquals(response.status, Status.Found);
});
