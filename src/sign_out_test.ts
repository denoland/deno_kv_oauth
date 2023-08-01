// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import { assertEquals, Status, type Tokens } from "../dev_deps.ts";
import { signOut } from "./sign_out.ts";
import {
  getTokensBySession,
  SessionKey,
  setTokensBySession,
  SITE_COOKIE_NAME,
  stringifySessionKeyCookie,
} from "./core.ts";

Deno.test("signOut()", async (test) => {
  const sessionKey: SessionKey = [Date.now(), crypto.randomUUID()];
  const tokens: Tokens = {
    accessToken: crypto.randomUUID(),
    tokenType: crypto.randomUUID(),
  };
  await setTokensBySession(sessionKey, tokens);
  const redirectUrl = "/why-hello-there";
  const request = new Request("http://example.com", {
    headers: {
      cookie: `${SITE_COOKIE_NAME}=${stringifySessionKeyCookie(sessionKey)}`,
    },
  });
  const response = await signOut(request, redirectUrl);

  await test.step("returns a redirect response", () => {
    assertEquals(response.body, null);
    assertEquals(response.headers.get("location"), redirectUrl);
    assertEquals(response.status, Status.Found);
  });

  await test.step("expired session cookie is correctly set", () => {
    assertEquals(
      response.headers.get("set-cookie"),
      `${SITE_COOKIE_NAME}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT`,
    );
  });

  await test.step("deletes the tokens entry in KV", async () => {
    assertEquals(await getTokensBySession(sessionKey), null);
  });
});
