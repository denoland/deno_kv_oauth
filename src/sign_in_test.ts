// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import { signIn } from "./sign_in.ts";
import {
  assertEquals,
  assertNotEquals,
  getSetCookies,
  OAuth2Client,
  Status,
} from "../dev_deps.ts";
import {
  deleteOAuthSession,
  getOAuthSession,
  OAUTH_COOKIE_NAME,
} from "./_core.ts";

Deno.test("signIn()", async (test) => {
  await test.step("for insecure origin", async () => {
    const client = new OAuth2Client({
      clientId: crypto.randomUUID(),
      clientSecret: crypto.randomUUID(),
      authorizationEndpointUri: "https://example.com/authorize",
      tokenUri: "https://example.com/token",
    });

    const request = new Request("http://my-site.com");
    const response = await signIn(request, client);

    assertEquals(response.body, null);
    assertNotEquals(response.headers.get("location"), null);
    assertNotEquals(response.headers.get("set-cookie"), null);
    assertEquals(response.status, Status.Found);

    const [setCookie] = getSetCookies(response.headers);
    assertEquals(setCookie.name, OAUTH_COOKIE_NAME);
    assertEquals(setCookie.httpOnly, true);
    assertEquals(setCookie.maxAge, 10 * 60);
    assertEquals(setCookie.sameSite, "Lax");
    assertEquals(setCookie.path, "/");

    const tokens = await getOAuthSession(setCookie.value);
    const state = new URL(response.headers.get("location")!).searchParams.get(
      "state",
    );
    assertNotEquals(tokens, null);
    assertEquals(tokens!.state, state);

    // Cleanup
    await deleteOAuthSession(setCookie.value);
  });

  await test.step("for secure origin", async () => {
    const client = new OAuth2Client({
      clientId: crypto.randomUUID(),
      clientSecret: crypto.randomUUID(),
      authorizationEndpointUri: "https://example.com/authorize",
      tokenUri: "https://example.com/token",
    });

    const request = new Request("https://my-site.com");
    const response = await signIn(request, client);

    assertEquals(response.body, null);
    assertNotEquals(response.headers.get("location"), null);
    assertNotEquals(response.headers.get("set-cookie"), null);
    assertEquals(response.status, Status.Found);

    const [setCookie] = getSetCookies(response.headers);
    assertEquals(setCookie.name, `__Host-${OAUTH_COOKIE_NAME}`);
    assertEquals(setCookie.httpOnly, true);
    assertEquals(setCookie.maxAge, 10 * 60);
    assertEquals(setCookie.sameSite, "Lax");
    assertEquals(setCookie.path, "/");

    const tokens = await getOAuthSession(setCookie.value);
    const state = new URL(response.headers.get("location")!).searchParams.get(
      "state",
    );
    assertNotEquals(tokens, null);
    assertEquals(tokens!.state, state);

    // Cleanup
    await deleteOAuthSession(setCookie.value);
  });
});
