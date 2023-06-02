import { OAuth2Client, OAuth2ClientConfig } from "../deps.ts";

export type Provider = "github" | "discord";

function createGitHubClientConfig(): OAuth2ClientConfig {
  return {
    clientId: Deno.env.get("GITHUB_CLIENT_ID")!,
    clientSecret: Deno.env.get("GITHUB_CLIENT_SECRET")!,
    authorizationEndpointUri: "https://github.com/login/oauth/authorize",
    tokenUri: "https://github.com/login/oauth/access_token",
  };
}

function createDiscordClientConfig(): OAuth2ClientConfig {
  return {
    clientId: Deno.env.get("DISCORD_CLIENT_ID")!,
    clientSecret: Deno.env.get("DISCORD_CLIENT_SECRET")!,
    authorizationEndpointUri: "https://discord.com/oauth2/authorize",
    tokenUri: "https://discord.com/api/oauth2/token",
  };
}

export function createClient(provider: Provider): OAuth2Client {
  switch (provider) {
    case "github":
      return new OAuth2Client(createGitHubClientConfig());
    case "discord":
      return new OAuth2Client(createDiscordClientConfig());
    default:
      throw new Error(`Provider ID "${provider}" not supported`);
  }
}
