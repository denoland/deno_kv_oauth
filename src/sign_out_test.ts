// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import { assertEquals, Status, type Tokens } from "../deps.ts";
import { signOut } from "./sign_out.ts";
import {
  deleteTokensBySiteSession,
  getTokensBySiteSession,
  setTokensBySiteSession,
  SITE_COOKIE_NAME,
} from "./_core.ts";

Deno.test("signOut()", async (test) => {
  await test.step("signed out with default redirect URL", async () => {
    const request = new Request("http://example.com");
    const response = await signOut(request);

    // Is plain redirect response
    assertEquals(response.headers.get("location"), "/");
    assertEquals(response.status, Status.Found);
  });

  await test.step("signed out with defined redirect URL", async () => {
    const request = new Request("http://example.com");
    const redirectUrl = "/why-hello-there";
    const response = await signOut(request, redirectUrl);

    // Is plain redirect response
    assertEquals(response.headers.get("location"), redirectUrl);
    assertEquals(response.status, Status.Found);
  });

  await test.step("signed in with insecure origin", async () => {
    const siteSessionId = crypto.randomUUID();
    const tokens: Tokens = {
      accessToken: crypto.randomUUID(),
      tokenType: crypto.randomUUID(),
    };
    await setTokensBySiteSession(siteSessionId, tokens);
    const request = new Request("http://example.com", {
      headers: {
        cookie: `${SITE_COOKIE_NAME}=${siteSessionId}`,
      },
    });
    const redirectUrl = "/why-hello-there";
    const response = await signOut(request, redirectUrl);

    assertEquals(await getTokensBySiteSession(siteSessionId), null);
    assertEquals(response.headers.get("location"), redirectUrl);
    assertEquals(response.status, Status.Found);
    assertEquals(
      response.headers.get("set-cookie"),
      `${SITE_COOKIE_NAME}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT`,
    );

    // Cleanup
    deleteTokensBySiteSession(siteSessionId);
  });

  await test.step("signed in with secure origin", async () => {
    const siteSessionId = crypto.randomUUID();
    const tokens: Tokens = {
      accessToken: crypto.randomUUID(),
      tokenType: crypto.randomUUID(),
    };
    await setTokensBySiteSession(siteSessionId, tokens);
    const request = new Request("https://example.com", {
      headers: {
        cookie: `__Host-${SITE_COOKIE_NAME}=${siteSessionId}`,
      },
    });
    const redirectUrl = "/why-hello-there";
    const response = await signOut(request, redirectUrl);

    assertEquals(await getTokensBySiteSession(siteSessionId), null);
    assertEquals(response.headers.get("location"), redirectUrl);
    assertEquals(response.status, Status.Found);
    assertEquals(
      response.headers.get("set-cookie"),
      `__Host-${SITE_COOKIE_NAME}=; Secure; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT`,
    );

    // Cleanup
    deleteTokensBySiteSession(siteSessionId);
  });
});
