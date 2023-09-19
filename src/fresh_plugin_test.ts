// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import { kvOAuthPlugin } from "./fresh_plugin.ts";
import { assert, assertArrayIncludes, assertNotEquals } from "../dev_deps.ts";
import { oauthConfig } from "./test_utils.ts";

Deno.test("kvOAuthPlugin() works correctly", async (test) => {
  await test.step("with default values", () => {
    const plugin = kvOAuthPlugin(oauthConfig);
    assertNotEquals(plugin.routes, undefined);
    assert(plugin.routes!.every((route) => route.handler !== undefined));
    assertArrayIncludes(plugin.routes!.map((route) => route.path), [
      "/oauth/signin",
      "/oauth/callback",
      "/oauth/signout",
    ]);
  });

  await test.step("with defined values", () => {
    const signInPath = "/signin";
    const callbackPath = "/callback";
    const signOutPath = "/signout";
    const plugin = kvOAuthPlugin(oauthConfig, {
      signInPath,
      callbackPath,
      signOutPath,
    });
    assertNotEquals(plugin.routes, undefined);
    assert(plugin.routes!.every((route) => route.handler !== undefined));
    assertArrayIncludes(plugin.routes!.map((route) => route.path), [
      signInPath,
      callbackPath,
      signOutPath,
    ]);
  });
});
