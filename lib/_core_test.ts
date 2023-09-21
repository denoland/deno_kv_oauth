// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import { delay } from "https://deno.land/std@0.202.0/async/delay.ts";
import { assert, assertEquals, type Tokens } from "../dev_deps.ts";
import {
  deleteOAuthSession,
  deleteTokens,
  getCookieName,
  getOAuthSession,
  getSuccessUrl,
  getTokens,
  isSecure,
  redirect,
  setOAuthSession,
  setTokens,
  toStoredTokens,
  toTokens,
} from "./_core.ts";
import {
  assertRedirect,
  randomOAuthSession,
  randomTokens,
} from "./_test_utils.ts";

Deno.test("isSecure()", () => {
  assertEquals(isSecure("https://example.com"), true);
  assertEquals(isSecure("http://example.com"), false);
});

Deno.test("getCookieName()", () => {
  assertEquals(getCookieName("hello", true), "__Host-hello");
  assertEquals(getCookieName("hello", false), "hello");
});

Deno.test("(get/set/delete)OAuthSession() work interchangeably", async () => {
  const id = crypto.randomUUID();

  // OAuth session doesn't yet exist
  assertEquals(await getOAuthSession(id), null);

  const oauthSession = randomOAuthSession();
  await setOAuthSession(id, oauthSession);
  assertEquals(await getOAuthSession(id), oauthSession);

  await deleteOAuthSession(id);
  assertEquals(await getOAuthSession(id), null);
});

Deno.test("setTokens() applies key expiry", async () => {
  const sessionId = crypto.randomUUID();
  const oauthSession = randomOAuthSession();
  await setOAuthSession(sessionId, oauthSession, { expireIn: 1_000 });

  assertEquals(await getOAuthSession(sessionId), oauthSession);
  await delay(10_000);
  assertEquals(await getOAuthSession(sessionId), null);
});

Deno.test("toStoredTokens() + toTokens() work interchangeably", () => {
  const tokens: Tokens = {
    ...randomTokens(),
    expiresIn: 42,
  };
  const currentTokens = toTokens(toStoredTokens(tokens));
  assertEquals(currentTokens.accessToken, tokens.accessToken);
  assertEquals(currentTokens.tokenType, tokens.tokenType);
  // expiresIn should be both positive and less than tokens.expiresIn
  assert(currentTokens.expiresIn! < tokens.expiresIn!);
  assert(currentTokens.expiresIn! > 0);
});

Deno.test("(get/set/delete)Tokens() work interchangeably", async () => {
  const sessionId = crypto.randomUUID();

  // Tokens don't yet exist
  assertEquals(await getTokens(sessionId), null);

  const tokens = randomTokens();
  await setTokens(sessionId, tokens);
  assertEquals(await getTokens(sessionId), tokens);

  await deleteTokens(sessionId);
  assertEquals(await getTokens(sessionId), null);
});

Deno.test("redirect() returns a redirect response", () => {
  const location = "/hello-there";
  const response = redirect(location);
  assertRedirect(response, location);
});

Deno.test("getSuccessUrl() returns `success_url` URL parameter, if defined", () => {
  assertEquals(
    getSuccessUrl(
      new Request(
        `http://example.com?success_url=${
          encodeURIComponent("http://test.com")
        }`,
      ),
    ),
    "http://test.com",
  );
});

Deno.test("getSuccessUrl() returns referer header of same origin, if defined", () => {
  const referer = "http://example.com/path";
  assertEquals(
    getSuccessUrl(
      new Request("http://example.com", { headers: { referer } }),
    ),
    referer,
  );
});

Deno.test("getSuccessUrl() returns root path if referer is of different origin", () => {
  assertEquals(
    getSuccessUrl(
      new Request("http://example.com", {
        headers: { referer: "http://test.com" },
      }),
    ),
    "/",
  );
});

Deno.test("getSuccessUrl() returns root path by default", () => {
  assertEquals(
    getSuccessUrl(new Request("http://example.com")),
    "/",
  );
});
