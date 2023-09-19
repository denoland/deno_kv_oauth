// Copyright 2023 the Deno authors. All rights reserved. MIT license.

import { assertEquals, assertThrows } from "../../dev_deps.ts";
import { getRequiredEnv } from "./get_required_env.ts";

Deno.test("getRequiredEnv()", () => {
  assertEquals(getRequiredEnv("HOME"), Deno.env.get("HOME"));
  assertThrows(
    () => getRequiredEnv("MADE_UP_VAR"),
    Error,
    '"MADE_UP_VAR" environment variable must be set',
  );
});
