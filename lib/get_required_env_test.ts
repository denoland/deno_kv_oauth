// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import { assertEquals, assertThrows } from "../dev_deps.ts";
import { getRequiredEnv } from "./get_required_env.ts";

Deno.test("getRequiredEnv()", () => {
  Deno.env.set("VAR_1", crypto.randomUUID());
  assertEquals(getRequiredEnv("VAR_1"), Deno.env.get("VAR_1"));
  assertThrows(
    () => getRequiredEnv("MADE_UP_VAR"),
    Error,
    '"MADE_UP_VAR" environment variable must be set',
  );
});
