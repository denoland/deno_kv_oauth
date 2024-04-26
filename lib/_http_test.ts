// Copyright 2023-2024 the Deno authors. All rights reserved. MIT license.
import { assertEquals } from "@std/assert";
import { getCookieName, getSuccessUrl, isHttps, redirect } from "./_http.ts";
import { assertRedirect } from "./_test_utils.ts";

Deno.test("isHttps()", () => {
  assertEquals(isHttps("https://example.com"), true);
  assertEquals(isHttps("http://example.com"), false);
});

Deno.test("getCookieName()", () => {
  assertEquals(getCookieName("hello", true), "__Host-hello");
  assertEquals(getCookieName("hello", false), "hello");
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
