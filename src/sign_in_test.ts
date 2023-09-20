// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import { signIn } from "./sign_in.ts";
import {
  assert,
  assertEquals,
  assertNotEquals,
  getSetCookies,
  Status,
} from "../dev_deps.ts";
import { getOAuthSession, OAUTH_COOKIE_NAME } from "./core.ts";
import { randomOAuthConfig } from "./test_utils.ts";

Deno.test("signIn()", async (test) => {
  const request = new Request("http://my-site.com");
  const response = await signIn(request, randomOAuthConfig());

  await test.step("returns a redirect response", () => {
    assertEquals(response.body, null);
    assertNotEquals(response.headers.get("location"), null);
    assertEquals(response.status, Status.Found);
  });

  const [setCookie] = getSetCookies(response.headers);
  await test.step("correctly sets the session cookie", () => {
    assertEquals(setCookie.name, OAUTH_COOKIE_NAME);
    assertEquals(setCookie.httpOnly, true);
    assertEquals(setCookie.maxAge, 10 * 60);
    assertEquals(setCookie.sameSite, "Lax");
    assertEquals(setCookie.path, "/");
  });

  await test.step("correctly sets the OAuth session entry in KV", async () => {
    const oauthSessionId = setCookie.value;
    const oauthSession = await getOAuthSession(oauthSessionId);
    const state = new URL(
      response.headers.get("location")!,
    ).searchParams.get("state");
    assert(oauthSession);
    assertEquals(oauthSession?.state, state);
  });

  await test.step("returns a redirect response with URL params", async () => {
    const responseWithUrlParams = await signIn(request, randomOAuthConfig(), {
      urlParams: { foo: "bar" },
    });

    const location = responseWithUrlParams.headers.get("location");
    assert(location !== null);

    const url = new URL(location);
    assertEquals(responseWithUrlParams.body, null);
    assertEquals(url.searchParams.get("foo"), "bar");
    assertEquals(responseWithUrlParams.status, Status.Found);
  });
});
