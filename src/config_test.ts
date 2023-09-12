// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import { fallbackToEnv } from "./config.ts";
import { assertEquals, AssertionError, assertThrows } from "../dev_deps.ts";
import { createOAuthConfig } from "https://deno.land/x/deno_kv_oauth@$VERSION/mod.ts";

Deno.test("fallbackToEnv returns explicit value", () => {
  const value = fallbackToEnv("value", "FALLBACK");
  assertEquals(value, "value");
});

Deno.test("fallbackToEnv uses env var when no explicit value given", () => {
  Deno.env.set("FALLBACK", "value");
  const value = fallbackToEnv(undefined, "FALLBACK");
  assertEquals(value, "value");
});

Deno.test("fallbackToEnv throws when no explicit value or env var ", () => {
  Deno.env.delete("FALLBACK");
  assertThrows(
    () => {
      fallbackToEnv(undefined, "FALLBACK");
    },
    AssertionError,
    "FALLBACK env var is required",
  );
});

Deno.test("createOAuthConfig combines configs", () => {
  Deno.env.set("TEST_CLIENT_ID", "id_from_env");
  Deno.env.set("TEST_CLIENT_SECRET", "secret_from_env");

  const config = createOAuthConfig({
    name: "Test",
    authorizationEndpointUri: "https://example.com/authorize",
    tokenUri: "https://example.com/token",
    scope: ["default"],
  }, {
    redirectUri: "/callback",
  });

  assertEquals(config.name, "Test");
  assertEquals(config.clientId, "id_from_env");
  assertEquals(config.clientSecret, "secret_from_env");
  assertEquals(
    config.authorizationEndpointUri,
    "https://example.com/authorize",
  );
  assertEquals(config.tokenUri, "https://example.com/token");
  assertEquals(config.scope, ["default"]);
});

Deno.test("createOAuthConfig prefers user provided client props over env vars and provider defaults", () => {
  Deno.env.set("TEST_CLIENT_ID", "id_from_env");
  Deno.env.set("TEST_CLIENT_SECRET", "secret_from_env");

  const config = createOAuthConfig({
    name: "Test",
    clientId: "default_id",
    clientSecret: "default_secret",
    authorizationEndpointUri: "https://example.com/authorize",
    tokenUri: "https://example.com/token",
    scope: ["default"],
  }, {
    clientId: "user_id",
    clientSecret: "user_secret",
    redirectUri: "/callback",
  });

  assertEquals(config.clientId, "user_id");
  assertEquals(config.clientSecret, "user_secret");
});

Deno.test("createOAuthConfig prefers user provided scope", () => {
  const config = createOAuthConfig({
    name: "Test",
    clientId: "default_id",
    clientSecret: "default_secret",
    authorizationEndpointUri: "https://example.com/authorize",
    tokenUri: "https://example.com/token",
    scope: ["default"],
  }, {
    redirectUri: "/callback",
    scope: ["override"],
  });

  assertEquals(config.scope, ["override"]);
});
