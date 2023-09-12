// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import { assertEquals } from "../dev_deps.ts";
import * as createOAuthConfigFns from "./providers.ts";

[
  "Auth0",
  "Discord",
  "Dropbox",
  "Facebook",
  "GitHub",
  "GitLab",
  "Google",
  "Notion",
  "Okta",
  "Patreon",
  "Slack",
  "Spotify",
  "Twitter",
].map((provider) => {
  const fnName = `create${provider}OAuthConfig`;
  Deno.test(`${fnName}() returns the correctly configured config`, () => {
    const clientId = crypto.randomUUID();
    const clientSecret = crypto.randomUUID();
    const redirectUri = "http://example.com";
    const scope = ["scope"];

    const envVarKeyPrefix = provider.toUpperCase();
    Deno.env.set(`${envVarKeyPrefix}_CLIENT_ID`, clientId);
    Deno.env.set(`${envVarKeyPrefix}_CLIENT_SECRET`, clientSecret);
    Deno.env.set(`${envVarKeyPrefix}_DOMAIN`, "example.com");

    // @ts-ignore Trust me
    const config = createOAuthConfigFns[fnName]({ redirectUri, scope });

    assertEquals(config.clientId, clientId);
    assertEquals(config.clientSecret, clientSecret);
    assertEquals(config.redirectUri, redirectUri);
    assertEquals(config.scope, scope);
  });
});
