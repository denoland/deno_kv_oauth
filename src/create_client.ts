import { assert } from "https://deno.land/std@0.189.0/testing/asserts.ts";
import { OAuth2Client, OAuth2ClientConfig } from "../deps.ts";

export type Provider = "github" | "discord";

function createGitHubClientConfig(
  moreOAuth2ClientConfig?: OAuth2ClientConfig,
): OAuth2ClientConfig {
  return {
    ...moreOAuth2ClientConfig,
    clientId: Deno.env.get("GITHUB_CLIENT_ID")!,
    clientSecret: Deno.env.get("GITHUB_CLIENT_SECRET")!,
    authorizationEndpointUri: "https://github.com/login/oauth/authorize",
    tokenUri: "https://github.com/login/oauth/access_token",
  };
}

function createDiscordClientConfig(
  moreOAuth2ClientConfig?: OAuth2ClientConfig,
): OAuth2ClientConfig {
  assert(
    moreOAuth2ClientConfig?.defaults?.scope,
    "OAuth2 scope is required for Discord client config",
  );
  return {
    ...moreOAuth2ClientConfig,
    clientId: Deno.env.get("DISCORD_CLIENT_ID")!,
    clientSecret: Deno.env.get("DISCORD_CLIENT_SECRET")!,
    authorizationEndpointUri: "https://discord.com/oauth2/authorize",
    tokenUri: "https://discord.com/api/oauth2/token",
  };
}

export function createClient(
  provider: Provider,
  moreOAuth2ClientConfig?: OAuth2ClientConfig,
): OAuth2Client {
  switch (provider) {
    case "github":
      return new OAuth2Client(createGitHubClientConfig(moreOAuth2ClientConfig));
    case "discord":
      return new OAuth2Client(
        createDiscordClientConfig(moreOAuth2ClientConfig),
      );
    default:
      throw new Error(`Provider ID "${provider}" not supported`);
  }
}
