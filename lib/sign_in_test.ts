// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import { signIn } from "./sign_in.ts";
import { assertEquals, assertNotEquals, getSetCookies } from "../dev_deps.ts";
import { getAndDeleteOAuthSession, OAUTH_COOKIE_NAME } from "./_core.ts";
import { assertRedirect, randomOAuthConfig } from "./_test_utils.ts";

Deno.test("signIn() returns a response that signs-in the user", async () => {
  const request = new Request("http://example.com/signin");

  const response = await signIn(request, randomOAuthConfig());
  assertRedirect(response);

  const [setCookie] = getSetCookies(response.headers);
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
  const request = new Request("http://example.com/signin");
  const response = await signIn(request, randomOAuthConfig(), {
    urlParams: { foo: "bar" },
  });
  assertRedirect(response);
  const location = response.headers.get("location")!;
  assertEquals(new URL(location).searchParams.get("foo"), "bar");
});
