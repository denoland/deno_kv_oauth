// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import { assertEquals, Status, type Tokens } from "../dev_deps.ts";
import { signOut } from "./sign_out.ts";
import {
  deleteStoredTokensBySession,
  getTokensBySession,
  setTokensBySession,
  SITE_COOKIE_NAME,
} from "./_core.ts";

Deno.test("signOut()", async (test) => {
  const sessionId = crypto.randomUUID();
  const tokens: Tokens = {
    accessToken: crypto.randomUUID(),
    tokenType: crypto.randomUUID(),
  };
  await setTokensBySession(sessionId, tokens);
  const redirectUrl = "/why-hello-there";
  const request = new Request("http://example.com", {
    headers: {
      cookie: `${SITE_COOKIE_NAME}=${sessionId}`,
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
    assertEquals(await getTokensBySession(sessionId), null);
  });

  // Cleanup
  await deleteStoredTokensBySession(sessionId);
});
