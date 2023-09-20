// Copyright 2023 the Deno authors. All rights reserved. MIT license.

import { assertEquals } from "../dev_deps.ts";
import { createAuth0OAuthConfig } from "./create_auth0_oauth_config.ts";

Deno.test("createAuth0OAuthConfig()", () => {
  const domain = crypto.randomUUID();
  const clientId = crypto.randomUUID();
  const clientSecret = crypto.randomUUID();
  const redirectUri = `http://${crypto.randomUUID()}.com`;
  const scope = crypto.randomUUID();
  Deno.env.set("AUTH0_DOMAIN", domain);
  Deno.env.set("AUTH0_CLIENT_ID", clientId);
  Deno.env.set("AUTH0_CLIENT_SECRET", clientSecret);

  const oauthConfig = createAuth0OAuthConfig({ redirectUri, scope });
  assertEquals(oauthConfig.clientId, clientId);
  assertEquals(oauthConfig.clientSecret, clientSecret);
  assertEquals(oauthConfig.redirectUri, redirectUri);
  assertEquals(oauthConfig.defaults?.scope, scope);
});
