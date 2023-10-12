// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import { assertEquals, assertRejects } from "../dev_deps.ts";
import { signOut } from "./sign_out.ts";
import { SITE_COOKIE_NAME } from "./_http.ts";
import { assertRedirect } from "./_test_utils.ts";
import { setSiteSession } from "./_kv.ts";

Deno.test("signOut() returns a redirect response if the user is not signed-in", async () => {
  const request = new Request("http://example.com/signout");
  const response = await signOut(request);

  assertRedirect(response, "/");
});

Deno.test("signOut() returns a response that signs out the signed-in user", async () => {
  const sessionId = crypto.randomUUID();
  await setSiteSession(sessionId);
  const request = new Request("http://example.com/signout", {
    headers: {
      cookie: `${SITE_COOKIE_NAME}=${sessionId}`,
    },
  });
  const response = await signOut(request);

  assertRedirect(response, "/");
  assertEquals(
    response.headers.get("set-cookie"),
    `${SITE_COOKIE_NAME}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT`,
  );
});

Deno.test("signOut() returns a response that signs out the signed-in user with cookie options", async () => {
  const cookieOptions = {
    name: "triple-choc",
    domain: "example.com",
    path: "/path",
  };
  const sessionId = crypto.randomUUID();
  await setSiteSession(sessionId);
  const request = new Request("http://example.com/signout", {
    headers: {
      cookie: `${cookieOptions.name}=${sessionId}`,
    },
  });
  const response = await signOut(request, { cookieOptions });

  assertRedirect(response, "/");
  assertEquals(
    response.headers.get("set-cookie"),
    `${cookieOptions.name}=; Domain=${cookieOptions.domain}; Path=${cookieOptions.path}; Expires=Thu, 01 Jan 1970 00:00:00 GMT`,
  );
});

Deno.test("signOut() rejects when a session ID doesn't exist in the database", async () => {
  const sessionId = crypto.randomUUID();
  const request = new Request("http://example.com/signout", {
    headers: {
      cookie: `${SITE_COOKIE_NAME}=${sessionId}`,
    },
  });

  await assertRejects(
    async () => await signOut(request),
    Deno.errors.NotFound,
    "Site session not found",
  );
});
