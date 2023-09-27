// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import { kvOAuthPlugin } from "./fresh_plugin.ts";
import {
  assert,
  assertArrayIncludes,
  assertNotEquals,
  assertRejects,
  returnsNext,
  stub,
} from "../dev_deps.ts";
import {
  assertRedirect,
  randomOAuthConfig,
  randomOAuthSession,
  randomTokensBody,
} from "./_test_utils.ts";
import { getAndDeleteOAuthSession, setOAuthSession } from "./_kv.ts";
import { OAUTH_COOKIE_NAME } from "./_http.ts";
import type { Handler } from "$fresh/server.ts";

Deno.test("kvOAuthPlugin() works with default values", () => {
  const plugin = kvOAuthPlugin(randomOAuthConfig());
  assertNotEquals(plugin.routes, undefined);
  assert(plugin.routes!.every((route) => route.handler !== undefined));
  assertArrayIncludes(plugin.routes!.map((route) => route.path), [
    "/oauth/signin",
    "/oauth/callback",
    "/oauth/signout",
  ]);
});

Deno.test("kvOAuthPlugin() works with defined values", () => {
  const signInPath = "/signin";
  const callbackPath = "/callback";
  const signOutPath = "/signout";
  const plugin = kvOAuthPlugin(randomOAuthConfig(), {
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

Deno.test("kvOAuthPlugin() correctly handles the sign-in path", async () => {
  const request = new Request("http://example.com/oauth/signin");
  const plugin = kvOAuthPlugin(randomOAuthConfig());
  const handler = plugin.routes!.find((route) =>
    route.path === "/oauth/signin"
  )!.handler as Handler<undefined, undefined>;
  // @ts-ignore Trust me
  const response = await handler(request);

  assertRedirect(response);
});

Deno.test("kvOAuthPlugin() correctly handles the callback path", async () => {
  const fetchStub = stub(
    window,
    "fetch",
    returnsNext([Promise.resolve(Response.json(randomTokensBody()))]),
  );

  const oauthSessionId = crypto.randomUUID();
  const oauthSession = randomOAuthSession();
  await setOAuthSession(oauthSessionId, oauthSession, { expireIn: 1_000 });
  const searchParams = new URLSearchParams({
    "response_type": "code",
    "client_id": "clientId",
    "code_challenge_method": "S256",
    code: "code",
    state: oauthSession.state,
  });
  const request = new Request(
    `http://example.com/oauth/callback?${searchParams}`,
    {
      headers: { cookie: `${OAUTH_COOKIE_NAME}=${oauthSessionId}` },
    },
  );
  const plugin = kvOAuthPlugin(randomOAuthConfig());
  const handler = plugin.routes!.find((route) =>
    route.path === "/oauth/callback"
  )!.handler as Handler<undefined, undefined>;
  // @ts-ignore Trust me
  const response = await handler(request);

  fetchStub.restore();

  assertRedirect(response);
  await assertRejects(
    async () => await getAndDeleteOAuthSession(oauthSessionId),
    Deno.errors.NotFound,
    "OAuth session not found",
  );
});

Deno.test("kvOAuthPlugin() correctly handles the sign-out path", async () => {
  const request = new Request("http://example.com/oauth/signout");
  const plugin = kvOAuthPlugin(randomOAuthConfig());
  const handler = plugin.routes!.find((route) =>
    route.path === "/oauth/signout"
  )!.handler as Handler<undefined, undefined>;
  // @ts-ignore Trust me
  const response = await handler(request);

  assertRedirect(response);
});
