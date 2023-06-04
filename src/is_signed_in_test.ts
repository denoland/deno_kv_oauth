// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import { assertEquals } from "../deps.ts";
import { SITE_COOKIE_NAME } from "./_core.ts";
import { isSignedIn } from "./is_signed_in.ts";

Deno.test("isSignedIn()", () => {
  const insecureRequest = new Request("http://example.com");
  assertEquals(isSignedIn(insecureRequest), false);

  insecureRequest.headers.set("cookie", "not-site-session=xxx");
  assertEquals(isSignedIn(insecureRequest), false);

  insecureRequest.headers.set("cookie", `${SITE_COOKIE_NAME}=xxx`);
  assertEquals(isSignedIn(insecureRequest), true);

  const secureRequest = new Request("https://example.com");
  assertEquals(isSignedIn(secureRequest), false);

  secureRequest.headers.set("cookie", "not-site-session=xxx");
  assertEquals(isSignedIn(secureRequest), false);

  secureRequest.headers.set("cookie", `__Host-${SITE_COOKIE_NAME}=xxx`);
  assertEquals(isSignedIn(secureRequest), true);
});
