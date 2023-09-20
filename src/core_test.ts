// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import { assert, assertEquals, Status, type Tokens } from "../dev_deps.ts";
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
} from "./core.ts";
import { randomOAuthSession, randomTokens } from "./test_utils.ts";

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

  // OAuth session doesn't yet exist
  assertEquals(await getOAuthSession(id), null);

  const oauthSession = randomOAuthSession();
  await setOAuthSession(id, oauthSession);
  assertEquals(await getOAuthSession(id), oauthSession);

  await deleteOAuthSession(id);
  assertEquals(await getOAuthSession(id), null);
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
  assert(!response.ok);
  assertEquals(response.body, null);
  assertEquals(response.headers.get("location"), location);
  assertEquals(response.status, Status.Found);
});

Deno.test("getSuccessUrl()", async (test) => {
  await test.step("returns `success_url` URL parameter, if defined", () => {
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

  await test.step("returns referer header of same origin, if defined", () => {
    const referer = "http://example.com/path";
    assertEquals(
      getSuccessUrl(
        new Request("http://example.com", { headers: { referer } }),
      ),
      referer,
    );
  });

  await test.step("returns root path if referer is of different origin", () => {
    assertEquals(
      getSuccessUrl(
        new Request("http://example.com", {
          headers: { referer: "http://test.com" },
        }),
      ),
      "/",
    );
  });

  await test.step("returns root path by default", () => {
    assertEquals(
      getSuccessUrl(new Request("http://example.com")),
      "/",
    );
  });
});
