// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import { redirect } from "./_http.ts";
import { assert, assertEquals, Status } from "../deps.ts";

Deno.test("redirect()", () => {
  const location = "/hello-there";

  const response = redirect(location);
  assert(!response.ok);
  assertEquals(response.body, null);
  assertEquals(response.headers.get("location"), location);
  assertEquals(response.status, Status.Found);
});
