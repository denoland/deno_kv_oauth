// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import { handleCallback } from "./handle_callback.ts";
import { assertRejects, OAuth2Client } from "../deps.ts";
import { OAUTH_COOKIE_NAME } from "./_core.ts";

Deno.test("handleCallback()", async (test) => {
  const client = new OAuth2Client({
    clientId: crypto.randomUUID(),
    clientSecret: crypto.randomUUID(),
    authorizationEndpointUri: "https://example.com/authorize",
    tokenUri: "https://example.com/token",
  });

  await test.step("rejects for no OAuth cookie", async () => {
    const request = new Request("http://example.com");
    await assertRejects(() => handleCallback(request, client));
  });

  await test.step("rejects for non-existent OAuth session", async () => {
    const request = new Request("http://example.com", {
      headers: { cookie: `${OAUTH_COOKIE_NAME}=xxx` },
    });
    await assertRejects(() => handleCallback(request, client));
  });
});
