// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import { assertEquals } from "../dev_deps.ts";
import {
  createDiscordOAuth2Client,
  createDropboxOAuth2Client,
  createFacebookOAuth2Client,
  createGitHubOAuth2Client,
  createGitLabOAuth2Client,
  createGoogleOAuth2Client,
  createNotionOAuth2Client,
  createSlackOAuth2Client,
  createTwitterOAuth2Client,
} from "./create_oauth2_client.ts";

Deno.test("createDiscordOAuth2Client() returns the correctly configured client", () => {
  const clientId = crypto.randomUUID();
  const clientSecret = crypto.randomUUID();
  const redirectUri = "http://example.com";
  const defaults = { scope: "scope" };

  Deno.env.set("DISCORD_CLIENT_ID", clientId);
  Deno.env.set("DISCORD_CLIENT_SECRET", clientSecret);

  const client = createDiscordOAuth2Client({ redirectUri, defaults });
  assertEquals(client.config.clientId, clientId);
  assertEquals(client.config.clientSecret, clientSecret);
  assertEquals(client.config.redirectUri, redirectUri);
  assertEquals(client.config.defaults, defaults);
});

Deno.test("createDropboxOAuth2Client() returns the correctly configured client", () => {
  const clientId = crypto.randomUUID();
  const clientSecret = crypto.randomUUID();
  const redirectUri = "http://example.com";
  const defaults = { scope: "scope" };

  Deno.env.set("DROPBOX_CLIENT_ID", clientId);
  Deno.env.set("DROPBOX_CLIENT_SECRET", clientSecret);

  const client = createDropboxOAuth2Client({ redirectUri, defaults });
  assertEquals(client.config.clientId, clientId);
  assertEquals(client.config.clientSecret, clientSecret);
  assertEquals(client.config.redirectUri, redirectUri);
  assertEquals(client.config.defaults, defaults);
});

Deno.test("createFacebookOAuth2Client() returns the correctly configured client", () => {
  const clientId = crypto.randomUUID();
  const clientSecret = crypto.randomUUID();
  const redirectUri = "http://example.com";
  const defaults = { scope: "scope" };

  Deno.env.set("FACEBOOK_CLIENT_ID", clientId);
  Deno.env.set("FACEBOOK_CLIENT_SECRET", clientSecret);

  const client = createFacebookOAuth2Client({ redirectUri, defaults });
  assertEquals(client.config.clientId, clientId);
  assertEquals(client.config.clientSecret, clientSecret);
  assertEquals(client.config.redirectUri, redirectUri);
  assertEquals(client.config.defaults, defaults);
});

Deno.test("createGitHubOAuth2Client() returns the correctly configured client", () => {
  const clientId = crypto.randomUUID();
  const clientSecret = crypto.randomUUID();
  const redirectUri = "http://example.com";
  const defaults = { scope: "scope" };

  Deno.env.set("GITHUB_CLIENT_ID", clientId);
  Deno.env.set("GITHUB_CLIENT_SECRET", clientSecret);

  const client = createGitHubOAuth2Client({ redirectUri, defaults });
  assertEquals(client.config.clientId, clientId);
  assertEquals(client.config.clientSecret, clientSecret);
  assertEquals(client.config.redirectUri, redirectUri);
  assertEquals(client.config.defaults, defaults);
});

Deno.test("createGitLabOAuth2Client() returns the correctly configured client", () => {
  const clientId = crypto.randomUUID();
  const clientSecret = crypto.randomUUID();
  const redirectUri = "http://example.com";
  const defaults = { scope: "scope" };

  Deno.env.set("GITLAB_CLIENT_ID", clientId);
  Deno.env.set("GITLAB_CLIENT_SECRET", clientSecret);

  const client = createGitLabOAuth2Client({ redirectUri, defaults });
  assertEquals(client.config.clientId, clientId);
  assertEquals(client.config.clientSecret, clientSecret);
  assertEquals(client.config.redirectUri, redirectUri);
  assertEquals(client.config.defaults, defaults);
});

Deno.test("createGoogleOAuth2Client() returns the correctly configured client", () => {
  const clientId = crypto.randomUUID();
  const clientSecret = crypto.randomUUID();
  const redirectUri = "http://example.com";
  const defaults = { scope: "scope" };

  Deno.env.set("GOOGLE_CLIENT_ID", clientId);
  Deno.env.set("GOOGLE_CLIENT_SECRET", clientSecret);

  const client = createGoogleOAuth2Client({ redirectUri, defaults });
  assertEquals(client.config.clientId, clientId);
  assertEquals(client.config.clientSecret, clientSecret);
  assertEquals(client.config.redirectUri, redirectUri);
  assertEquals(client.config.defaults, defaults);
});

Deno.test("createNotionOAuth2Client() returns the correctly configured client", () => {
  const clientId = crypto.randomUUID();
  const clientSecret = crypto.randomUUID();
  const redirectUri = "http://example.com";
  const defaults = { scope: "scope" };

  Deno.env.set("NOTION_CLIENT_ID", clientId);
  Deno.env.set("NOTION_CLIENT_SECRET", clientSecret);

  const client = createNotionOAuth2Client({ redirectUri, defaults });
  assertEquals(client.config.clientId, clientId);
  assertEquals(client.config.clientSecret, clientSecret);
  assertEquals(client.config.redirectUri, redirectUri);
  assertEquals(client.config.defaults, defaults);
});

Deno.test("createSlackOAuth2Client() returns the correctly configured client", () => {
  const clientId = crypto.randomUUID();
  const clientSecret = crypto.randomUUID();
  const redirectUri = "http://example.com";
  const defaults = { scope: "scope" };

  Deno.env.set("SLACK_CLIENT_ID", clientId);
  Deno.env.set("SLACK_CLIENT_SECRET", clientSecret);

  const client = createSlackOAuth2Client({ redirectUri, defaults });
  assertEquals(client.config.clientId, clientId);
  assertEquals(client.config.clientSecret, clientSecret);
  assertEquals(client.config.redirectUri, redirectUri);
  assertEquals(client.config.defaults, defaults);
});

Deno.test("createTwitterOAuth2Client() returns the correctly configured client", () => {
  const clientId = crypto.randomUUID();
  const clientSecret = crypto.randomUUID();
  const redirectUri = "http://example.com";
  const defaults = { scope: "scope" };

  Deno.env.set("TWITTER_CLIENT_ID", clientId);
  Deno.env.set("TWITTER_CLIENT_SECRET", clientSecret);

  const client = createTwitterOAuth2Client({ redirectUri, defaults });
  assertEquals(client.config.clientId, clientId);
  assertEquals(client.config.clientSecret, clientSecret);
  assertEquals(client.config.redirectUri, redirectUri);
  assertEquals(client.config.defaults, defaults);
});
