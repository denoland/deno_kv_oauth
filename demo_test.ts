// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import { assertStringIncludes } from "https://deno.land/std@0.191.0/testing/asserts.ts";
import { handler } from "./demo.ts";
import { assert, assertEquals, delay } from "./dev_deps.ts";
import { Status } from "./deps.ts";

const port = 8001;
Deno.serve({ port }, handler);

Deno.test("demo", async (test) => {
  await delay(100);

  await test.step("/ route returns a basic web page", async () => {
    const response = await fetch(`http://localhost:${port}`);
    const html = await response.text();

    assert(response.ok);
    assertEquals(response.status, 200);
    assertEquals(
      response.headers.get("content-type"),
      "text/html; charset=utf-8",
    );
    assertStringIncludes(html, '<a href="/signin">Sign in</a>');
  });

  await test.step("/signin returns a redirect response", async () => {
    const response = await fetch(`http://localhost:${port}/signin`);
    await response.body?.cancel();

    assert(response.ok);
    assertEquals(response.status, 200);
    assert(response.redirected);
  });

  await test.step("/callback route returns an error response", async () => {
    const response = await fetch(`http://localhost:${port}/callback`);
    await response.body?.cancel();

    assert(!response.ok);
    assertEquals(response.status, Status.InternalServerError);
  });

  await test.step("/signout returns a redirect response", async () => {
    const response = await fetch(`http://localhost:${port}/signout`);
    await response.body?.cancel();

    assert(response.ok);
    assertEquals(response.status, 200);
    assert(response.redirected);
  });
});
