// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import { assertEquals } from "../dev_deps.ts";
import * as createOAuthConfigFns from "./providers.ts";

/** @todo(iuioiua) Split into individual tests per platform. */
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
  Deno.test(`${fnName}() returns the correctly configured client`, () => {
    const clientId = crypto.randomUUID();
    const clientSecret = crypto.randomUUID();
    const redirectUri = "http://example.com";
    const scope = crypto.randomUUID();

    const envVarKeyPrefix = provider.toUpperCase();
    Deno.env.set(`${envVarKeyPrefix}_CLIENT_ID`, clientId);
    Deno.env.set(`${envVarKeyPrefix}_CLIENT_SECRET`, clientSecret);
    Deno.env.set("OKTA_DOMAIN", "okta_domain");
    Deno.env.set("AUTH0_DOMAIN", "auth0_domain");

    // @ts-ignore Trust me
    const client = createOAuthConfigFns[fnName](redirectUri, scope);
    assertEquals(client.clientId, clientId);
    assertEquals(client.clientSecret, clientSecret);
    assertEquals(client.redirectUri, redirectUri);
    assertEquals(client.defaults.scope, scope);
  });
});
