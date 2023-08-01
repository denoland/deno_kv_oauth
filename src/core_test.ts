// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import { assert, assertEquals, Status, type Tokens } from "../dev_deps.ts";
import {
  deleteOAuthSession,
  deleteStoredTokensBySession,
  getCookieName,
  getOAuthSession,
  getTokensBySession,
  isSecure,
  type OAuthSession,
  redirect,
  SessionKey,
  setOAuthSession,
  setTokensBySession,
  toStoredTokens,
  toTokens,
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
  const key: SessionKey = [Date.now(), crypto.randomUUID()];

  // OAuth 2.0 session doesn't yet exist
  assertEquals(await getOAuthSession(key), null);

  const oauthSession: OAuthSession = {
    state: crypto.randomUUID(),
    codeVerifier: crypto.randomUUID(),
  };
  await setOAuthSession(key, oauthSession);

  assertEquals(await getOAuthSession(key), oauthSession);

  await deleteOAuthSession(key);

  assertEquals(await getOAuthSession(key), null);
});

Deno.test("toStoredTokens() + toTokens() work interchangeably", () => {
  const initialTokens: Tokens = {
    accessToken: crypto.randomUUID(),
    tokenType: crypto.randomUUID(),
    expiresIn: 42,
  };
  const currentTokens = toTokens(toStoredTokens(initialTokens));
  assertEquals(currentTokens.accessToken, initialTokens.accessToken);
  assertEquals(currentTokens.tokenType, initialTokens.tokenType);
  assert(currentTokens.expiresIn! < initialTokens.expiresIn!);
});

Deno.test("(get/set/delete)TokensBySession() work interchangeably", async () => {
  const key: SessionKey = [Date.now(), crypto.randomUUID()];

  // Tokens don't yet exist
  assertEquals(await getTokensBySession(key), null);

  const tokens: Tokens = {
    accessToken: crypto.randomUUID(),
    tokenType: crypto.randomUUID(),
  };
  await setTokensBySession(key, tokens);

  assertEquals(await getTokensBySession(key), tokens);

  await deleteStoredTokensBySession(key);

  assertEquals(await getTokensBySession(key), null);
});

Deno.test("redirect() returns a redirect response", () => {
  const location = "/hello-there";

  const response = redirect(location);
  assert(!response.ok);
  assertEquals(response.body, null);
  assertEquals(response.headers.get("location"), location);
  assertEquals(response.status, Status.Found);
});
