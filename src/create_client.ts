// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import { assert, OAuth2Client, OAuth2ClientConfig } from "../deps.ts";

export type Provider = "discord" | "github" | "gitlab" | "google" | "slack";

/**
 * @see {@link https://discord.com/developers/docs/topics/oauth2}
 * @todo Define required config via types instead of assertions.
 */
function createDiscordClientConfig(
  moreOAuth2ClientConfig?: Partial<OAuth2ClientConfig>,
): OAuth2ClientConfig {
  assert(moreOAuth2ClientConfig?.redirectUri, "`redirectUri` must be defined");
  assert(
    moreOAuth2ClientConfig?.defaults?.scope,
    "`defaults.scope` must be defined",
  );
  return {
    ...moreOAuth2ClientConfig,
    clientId: Deno.env.get("DISCORD_CLIENT_ID")!,
    clientSecret: Deno.env.get("DISCORD_CLIENT_SECRET")!,
    authorizationEndpointUri: "https://discord.com/oauth2/authorize",
    tokenUri: "https://discord.com/api/oauth2/token",
  };
}

/**
 * @see {@link https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps}
 */
function createGitHubClientConfig(
  moreOAuth2ClientConfig?: Partial<OAuth2ClientConfig>,
): OAuth2ClientConfig {
  return {
    ...moreOAuth2ClientConfig,
    clientId: Deno.env.get("GITHUB_CLIENT_ID")!,
    clientSecret: Deno.env.get("GITHUB_CLIENT_SECRET")!,
    authorizationEndpointUri: "https://github.com/login/oauth/authorize",
    tokenUri: "https://github.com/login/oauth/access_token",
  };
}

/**
 * @see {@link https://developers.google.com/identity/protocols/oauth2/web-server}
 * @todo Define required config via types instead of assertions.
 */
function createGoogleClientConfig(
  moreOAuth2ClientConfig?: Partial<OAuth2ClientConfig>,
): OAuth2ClientConfig {
  assert(moreOAuth2ClientConfig?.redirectUri, "`redirectUri` must be defined");
  assert(
    moreOAuth2ClientConfig?.defaults?.scope,
    "`defaults.scope` must be defined",
  );
  return {
    ...moreOAuth2ClientConfig,
    clientId: Deno.env.get("GOOGLE_CLIENT_ID")!,
    clientSecret: Deno.env.get("GOOGLE_CLIENT_SECRET")!,
    authorizationEndpointUri: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUri: "https://oauth2.googleapis.com/token",
  };
}

/**
 * @see {@link https://docs.gitlab.com/ee/api/oauth2.html}
 * @todo Define required config via types instead of assertions.
 */
function createGitLabClientConfig(
  moreOAuth2ClientConfig?: Partial<OAuth2ClientConfig>,
): OAuth2ClientConfig {
  assert(moreOAuth2ClientConfig?.redirectUri, "`redirectUri` must be defined");
  assert(
    moreOAuth2ClientConfig?.defaults?.scope,
    "`defaults.scope` must be defined",
  );
  return {
    ...moreOAuth2ClientConfig,
    clientId: Deno.env.get("GITLAB_CLIENT_ID")!,
    clientSecret: Deno.env.get("GITLAB_CLIENT_SECRET")!,
    authorizationEndpointUri: "https://gitlab.com/oauth/authorize",
    tokenUri: "https://gitlab.com/oauth/token",
  };
}

/**
 * @see {@link https://api.slack.com/authentication/oauth-v2}
 * @todo Define required config via types instead of assertions.
 */
function createSlackClientConfig(
  moreOAuth2ClientConfig?: Partial<OAuth2ClientConfig>,
): OAuth2ClientConfig {
  assert(
    moreOAuth2ClientConfig?.defaults?.scope,
    "`defaults.scope` must be defined",
  );
  return {
    ...moreOAuth2ClientConfig,
    clientId: Deno.env.get("SLACK_CLIENT_ID")!,
    clientSecret: Deno.env.get("SLACK_CLIENT_SECRET")!,
    authorizationEndpointUri: "https://slack.com/oauth/v2/authorize",
    tokenUri: "https://slack.com/api/oauth.v2.access",
  };
}

export function createClient(
  provider: Provider,
  moreOAuth2ClientConfig?: Partial<OAuth2ClientConfig>,
): OAuth2Client {
  switch (provider) {
    case "discord":
      return new OAuth2Client(
        createDiscordClientConfig(moreOAuth2ClientConfig),
      );
    case "github":
      return new OAuth2Client(createGitHubClientConfig(moreOAuth2ClientConfig));
    case "gitlab":
      return new OAuth2Client(createGitLabClientConfig(moreOAuth2ClientConfig));
    case "google":
      return new OAuth2Client(createGoogleClientConfig(moreOAuth2ClientConfig));
    case "slack":
      return new OAuth2Client(createSlackClientConfig(moreOAuth2ClientConfig));
    default:
      throw new Error(`Provider ID "${provider}" not supported`);
  }
}
