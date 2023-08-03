// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import { assertEquals } from "../dev_deps.ts";
import * as createOAuth2ClientFns from "./providers.ts";

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
  "Twitch",
  "Twitter",
].map((provider) => {
  const fnName = `create${provider}OAuth2Client`;
  Deno.test(`${fnName}() returns the correctly configured client`, () => {
    const clientId = crypto.randomUUID();
    const clientSecret = crypto.randomUUID();
    const redirectUri = "http://example.com";
    const defaults = { scope: "scope" };

    const envVarKeyPrefix = provider.toUpperCase();
    Deno.env.set(`${envVarKeyPrefix}_CLIENT_ID`, clientId);
    Deno.env.set(`${envVarKeyPrefix}_CLIENT_SECRET`, clientSecret);

    // @ts-ignore Trust me
    const client = createOAuth2ClientFns[fnName]({ redirectUri, defaults });
    assertEquals(client.config.clientId, clientId);
    assertEquals(client.config.clientSecret, clientSecret);
    assertEquals(client.config.redirectUri, redirectUri);
    assertEquals(client.config.defaults, defaults);
  });
});
