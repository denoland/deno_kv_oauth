// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import { assertEquals } from "../dev_deps.ts";
import {
  createDiscordOAuth2Client,
  createGitHubOAuth2Client,
  createGitLabOAuth2Client,
  createGoogleOAuth2Client,
  createSlackOAuth2Client,
  createTwitterOAuth2Client,
} from "./create_oauth2_client.ts";

[
  {
    createOAuth2ClientFn: createDiscordOAuth2Client,
    provider: "Discord",
  },
  {
    createOAuth2ClientFn: createGitHubOAuth2Client,
    provider: "GitHub",
  },
  {
    createOAuth2ClientFn: createGitLabOAuth2Client,
    provider: "GitLab",
  },
  {
    createOAuth2ClientFn: createGoogleOAuth2Client,
    provider: "Google",
  },
  {
    createOAuth2ClientFn: createSlackOAuth2Client,
    provider: "Slack",
  },
  {
    createOAuth2ClientFn: createTwitterOAuth2Client,
    provider: "Twitter",
  },
].map((test) =>
  Deno.test(`create${test.provider}OAuth2Client() returns the correctly configured client`, () => {
    const clientId = crypto.randomUUID();
    const clientSecret = crypto.randomUUID();
    const redirectUri = "http://example.com";
    const defaults = { scope: "scope" };

    const envKeyPrefix = test.provider.toUpperCase();
    Deno.env.set(`${envKeyPrefix}_CLIENT_ID`, clientId);
    Deno.env.set(`${envKeyPrefix}_CLIENT_SECRET`, clientSecret);

    const client = test.createOAuth2ClientFn({ redirectUri, defaults });
    assertEquals(client.config.clientId, clientId);
    assertEquals(client.config.clientSecret, clientSecret);
    assertEquals(client.config.redirectUri, redirectUri);
    assertEquals(client.config.defaults, defaults);
  })
);
