// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import { assertEquals, assertStrictEquals } from "../../dev_deps.ts";
import { oauthConfig } from "../test_utils.ts";
import { resolveRedirectUri } from "./resolve_redirect_uri.ts";

Deno.test("resolveRedirectUri resolves relative URL and preserves rest of config", () => {
  const config = {
    ...oauthConfig,
    redirectUri: "/relative/callback",
  };

  const baseUrl = "https://example.com/auth";

  const { redirectUri, ...restOfResolvedConfig } = resolveRedirectUri(
    config,
    baseUrl,
  );

  assertEquals(redirectUri.toString(), "https://example.com/relative/callback");

  const { redirectUri: _, ...restOfOriginalConfig } = config;

  assertEquals(restOfResolvedConfig, restOfOriginalConfig);
});

Deno.test("resolveRedirectUri preserve whole config if URL is absolute", () => {
  const config = {
    ...oauthConfig,
    redirectUri: "https://example.com/absolute/callback",
  };

  const baseUrl = "https://example.com/auth";

  const resolved = resolveRedirectUri(config, baseUrl);

  assertStrictEquals(resolved, config);
});
