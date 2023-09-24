// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import { assertRejects } from "https://deno.land/std@0.202.0/assert/assert_rejects.ts";
import { assertEquals } from "../dev_deps.ts";
import {
  getAndDeleteOAuthSession,
  getCookieName,
  getSuccessUrl,
  isSecure,
  redirect,
  setOAuthSession,
} from "./_core.ts";
import { assertRedirect, randomOAuthSession } from "./_test_utils.ts";

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
  const oauthSession = randomOAuthSession();

  // OAuth session doesn't yet exist
  await assertRejects(
    async () => await getAndDeleteOAuthSession(id),
    Deno.errors.NotFound,
    "OAuth session not found",
  );

  await setOAuthSession(id, oauthSession);
  assertEquals(await getAndDeleteOAuthSession(id), oauthSession);
  await assertRejects(
    async () => await getAndDeleteOAuthSession(id),
    Deno.errors.NotFound,
    "OAuth session not found",
  );
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
