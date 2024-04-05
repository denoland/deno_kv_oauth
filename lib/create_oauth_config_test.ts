// Copyright 2023-2024 the Deno authors. All rights reserved. MIT license.
import { assertEquals } from "std/assert/assert_equals.ts";
import { createAuth0OAuthConfig } from "./create_auth0_oauth_config.ts";
import { createAzureAdb2cOAuthConfig } from "./create_azure_adb2c_oauth_config.ts";
import { createAzureAdOAuthConfig } from "./create_azure_ad_oauth_config.ts";
import { createClerkOAuthConfig } from "./create_clerk_oauth_config.ts";
import { createDiscordOAuthConfig } from "./create_discord_oauth_config.ts";
import { createDropboxOAuthConfig } from "./create_dropbox_oauth_config.ts";
import { createFacebookOAuthConfig } from "./create_facebook_oauth_config.ts";
import { createGitHubOAuthConfig } from "./create_github_oauth_config.ts";
import { createGitLabOAuthConfig } from "./create_gitlab_oauth_config.ts";
import { createGoogleOAuthConfig } from "./create_google_oauth_config.ts";
import { createLogtoOAuthConfig } from "./create_logto_oauth_config.ts";
import { createNotionOAuthConfig } from "./create_notion_oauth_config.ts";
import { createOktaOAuthConfig } from "./create_okta_oauth_config.ts";
import { createPatreonOAuthConfig } from "./create_patreon_oauth_config.ts";
import { createSlackOAuthConfig } from "./create_slack_oauth_config.ts";
import { createSpotifyOAuthConfig } from "./create_spotify_oauth_config.ts";
import { createTwitterOAuthConfig } from "./create_twitter_oauth_config.ts";

[
  {
    envPrefix: "AUTH0",
    createOAuthConfigFn: createAuth0OAuthConfig,
  },
  {
    envPrefix: "AZURE_ADB2C",
    createOAuthConfigFn: createAzureAdb2cOAuthConfig,
  },
  {
    envPrefix: "AZURE_AD",
    createOAuthConfigFn: createAzureAdOAuthConfig,
  },
  {
    envPrefix: "CLERK",
    createOAuthConfigFn: createClerkOAuthConfig,
  },
  {
    envPrefix: "DISCORD",
    createOAuthConfigFn: createDiscordOAuthConfig,
  },
  {
    envPrefix: "DROPBOX",
    createOAuthConfigFn: createDropboxOAuthConfig,
  },
  {
    envPrefix: "FACEBOOK",
    createOAuthConfigFn: createFacebookOAuthConfig,
  },
  {
    envPrefix: "GITHUB",
    createOAuthConfigFn: createGitHubOAuthConfig,
  },
  {
    envPrefix: "GITLAB",
    createOAuthConfigFn: createGitLabOAuthConfig,
  },
  {
    envPrefix: "GOOGLE",
    createOAuthConfigFn: createGoogleOAuthConfig,
  },
  {
    envPrefix: "LOGTO",
    createOAuthConfigFn: createLogtoOAuthConfig,
  },
  {
    envPrefix: "NOTION",
    createOAuthConfigFn: createNotionOAuthConfig,
  },
  {
    envPrefix: "OKTA",
    createOAuthConfigFn: createOktaOAuthConfig,
  },
  {
    envPrefix: "PATREON",
    createOAuthConfigFn: createPatreonOAuthConfig,
  },
  {
    envPrefix: "SLACK",
    createOAuthConfigFn: createSlackOAuthConfig,
  },
  {
    envPrefix: "SPOTIFY",
    createOAuthConfigFn: createSpotifyOAuthConfig,
  },
  {
    envPrefix: "TWITTER",
    createOAuthConfigFn: createTwitterOAuthConfig,
  },
].map(({ envPrefix, createOAuthConfigFn }) =>
  Deno.test(`${createOAuthConfigFn.name}()`, () => {
    const clientId = crypto.randomUUID();
    const clientSecret = crypto.randomUUID();
    const redirectUri = `http://${crypto.randomUUID}.com`;
    const scope = crypto.randomUUID();

    Deno.env.set(`${envPrefix}_CLIENT_ID`, clientId);
    Deno.env.set(`${envPrefix}_CLIENT_SECRET`, clientSecret);
    // Only needed for Okta, Auth0, and AzureADB2C but set for all providers anyway
    Deno.env.set(`${envPrefix}_DOMAIN`, crypto.randomUUID());
    // Only needed for Azure and AzureADB2C but set for all providers anyway
    Deno.env.set(`${envPrefix}_TENANT_ID`, crypto.randomUUID());
    // Only needed for AzureADB2C but set for all providers anyway
    Deno.env.set(`${envPrefix}_POLICY`, crypto.randomUUID());

    const oauthConfig = createOAuthConfigFn({ redirectUri, scope });
    assertEquals(oauthConfig.clientId, clientId);
    assertEquals(oauthConfig.clientSecret, clientSecret);
    assertEquals(oauthConfig.redirectUri, redirectUri);
    assertEquals(oauthConfig.defaults?.scope, scope);
  }),
);
