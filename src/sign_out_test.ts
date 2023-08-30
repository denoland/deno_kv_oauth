// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import { assertEquals, Status } from "../dev_deps.ts";
import { signOut } from "./sign_out.ts";
import { getTokens, setTokens, SITE_COOKIE_NAME } from "./core.ts";
import { genTokens } from "./test_utils.ts";

Deno.test("signOut()", async (test) => {
  const sessionId = crypto.randomUUID();
  const tokens = genTokens();
  await setTokens(sessionId, tokens);
  const successUrl = "/why-hello-there";
  const request = new Request("http://example.com?success_url=" + successUrl, {
    headers: {
      cookie: `${SITE_COOKIE_NAME}=${sessionId}`,
    },
  });
  const response = await signOut(request);

  await test.step("returns a redirect response", () => {
    assertEquals(response.body, null);
    assertEquals(response.headers.get("location"), successUrl);
    assertEquals(response.status, Status.Found);
  });

  await test.step("expired session cookie is correctly set", () => {
    assertEquals(
      response.headers.get("set-cookie"),
      `${SITE_COOKIE_NAME}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT`,
    );
  });

  await test.step("deletes the tokens entry in KV", async () => {
    assertEquals(await getTokens(sessionId), null);
  });
});
