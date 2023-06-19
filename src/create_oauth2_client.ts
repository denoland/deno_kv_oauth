// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import { OAuth2Client, OAuth2ClientConfig } from "../deps.ts";

// For providers that have OAuth 2.0 configuration requirements
type WithScope = { defaults: { scope: string | string[] } };
type WithRedirectUri = { redirectUri: string };

/**
 * Creates an OAuth 2.0 client with Discord as the provider.
 *
 * Requires `--allow-env[=DISCORD_CLIENT_ID,DISCORD_CLIENT_SECRET]` permissions and environment variables:
 * 1. `DISCORD_CLIENT_ID`
 * 2. `DISCORD_CLIENT_SECRET`
 *
 * @param additionalOAuth2ClientConfig Requires `redirectUri` and `defaults.scope` properties.
 *
 * @example
 * ```ts
 * import { createDiscordOAuth2Client } from "https://deno.land/x/deno_kv_oauth@$VERSION/mod.ts";
 *
 * const oauth2Client = createDiscordOAuth2Client({
 *  redirectUri: "http://localhost:8000/callback",
 *  defaults: {
 *    scope: "identify"
 *  }
 * });
 * ```
 *
 * @see {@link https://discord.com/developers/docs/topics/oauth2}
 */
export function createDiscordOAuth2Client(
  additionalOAuth2ClientConfig:
    & Partial<OAuth2ClientConfig>
    & WithScope
    & WithRedirectUri,
): OAuth2Client {
  return new OAuth2Client({
    clientId: Deno.env.get("DISCORD_CLIENT_ID")!,
    clientSecret: Deno.env.get("DISCORD_CLIENT_SECRET")!,
    authorizationEndpointUri: "https://discord.com/oauth2/authorize",
    tokenUri: "https://discord.com/api/oauth2/token",
    ...additionalOAuth2ClientConfig,
  });
}

/**
 * Creates an OAuth 2.0 client with Dropbox as the provider.
 *
 * Requires `--allow-env[=DROPBOX_CLIENT_ID,DROPBOX_CLIENT_SECRET]` permissions and environment variables:
 * 1. `DROPBOX_CLIENT_ID`
 * 2. `DROPBOX_CLIENT_SECRET`
 *
 * @param additionalOAuth2ClientConfig Requires `redirectUri` property.
 *
 * @example
 * ```ts
 * import { createDropboxOAuth2Client } from "https://deno.land/x/deno_kv_oauth@$VERSION/mod.ts";
 *
 * const oauth2Client = createDropboxOAuth2Client({
 *   redirectUri: "http://localhost:8000/callback",
 * });
 * ```
 *
 * @see {@link https://developers.dropbox.com/oauth-guide}
 */
export function createDropboxOAuth2Client(
  additionalOAuth2ClientConfig:
    & Partial<OAuth2ClientConfig>
    & WithRedirectUri,
): OAuth2Client {
  return new OAuth2Client({
    clientId: Deno.env.get("DROPBOX_CLIENT_ID")!,
    clientSecret: Deno.env.get("DROPBOX_CLIENT_SECRET")!,
    authorizationEndpointUri: "https://www.dropbox.com/oauth2/authorize",
    tokenUri: "https://api.dropboxapi.com/oauth2/token",
    ...additionalOAuth2ClientConfig,
  });
}

/**
 * Creates an OAuth 2.0 client with GitHub as the provider.
 *
 * Requires `--allow-env[=GITHUB_CLIENT_ID,GITHUB_CLIENT_SECRET]` permissions and environment variables:
 * 1. `GITHUB_CLIENT_ID`
 * 2. `GITHUB_CLIENT_SECRET`
 *
 * @example
 * ```ts
 * import { createGitHubOAuth2Client } from "https://deno.land/x/deno_kv_oauth@$VERSION/mod.ts";
 *
 * const oauth2Client = createGitHubOAuth2Client();
 * ```
 *
 * @see {@link https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps}
 */
export function createGitHubOAuth2Client(
  additionalOAuth2ClientConfig?: Partial<OAuth2ClientConfig>,
): OAuth2Client {
  return new OAuth2Client({
    clientId: Deno.env.get("GITHUB_CLIENT_ID")!,
    clientSecret: Deno.env.get("GITHUB_CLIENT_SECRET")!,
    authorizationEndpointUri: "https://github.com/login/oauth/authorize",
    tokenUri: "https://github.com/login/oauth/access_token",
    ...additionalOAuth2ClientConfig,
  });
}

/**
 * Creates an OAuth 2.0 client with Facebook as the provider.
 *
 * Requires `--allow-env[=FACEBOOK_CLIENT_ID,FACEBOOK_CLIENT_SECRET]` permissions and environment variables:
 * 1. `FACEBOOK_CLIENT_ID`
 * 2. `FACEBOOK_CLIENT_SECRET`
 *
 * @param additionalOAuth2ClientConfig Requires `redirectUri` and `defaults.scope` properties.
 *
 * @example
 * ```ts
 * import { createFacebookOAuth2Client } from "https://deno.land/x/deno_kv_oauth@$VERSION/mod.ts";
 *
 * const oauth2Client = createFacebookOAuth2Client({
 *   redirectUri: "http://localhost:8000/callback",
 *   defaults: {
 *    scope: "email"
 *   }
 * });
 * ```
 *
 * @see {@link https://developers.facebook.com/docs/facebook-login/guides/advanced/manual-flow}
 */
export function createFacebookOAuth2Client(
  additionalOAuth2ClientConfig:
    & Partial<OAuth2ClientConfig>
    & WithScope
    & WithRedirectUri,
): OAuth2Client {
  return new OAuth2Client({
    clientId: Deno.env.get("FACEBOOK_CLIENT_ID")!,
    clientSecret: Deno.env.get("FACEBOOK_CLIENT_SECRET")!,
    authorizationEndpointUri: "https://www.facebook.com/v17.0/dialog/oauth",
    tokenUri: "https://graph.facebook.com/v17.0/oauth/access_token",
    ...additionalOAuth2ClientConfig,
  });
}

/**
 * Creates an OAuth 2.0 client with GitLab as the provider.
 *
 * Requires `--allow-env[=GITLAB_CLIENT_ID,GITLAB_CLIENT_SECRET]` permissions and environment variables:
 * 1. `GITLAB_CLIENT_ID`
 * 2. `GITLAB_CLIENT_SECRET`
 *
 * @param additionalOAuth2ClientConfig Requires `redirectUri` and `defaults.scope` properties.
 *
 * @example
 * ```ts
 * import { createGitLabOAuth2Client } from "https://deno.land/x/deno_kv_oauth@$VERSION/mod.ts";
 *
 * const oauth2Client = createGitLabOAuth2Client({
 *  redirectUri: "http://localhost:8000/callback",
 *  defaults: {
 *    scope: "profile"
 *  }
 * });
 * ```
 *
 * @see {@link https://docs.gitlab.com/ee/api/oauth2.html}
 */
export function createGitLabOAuth2Client(
  additionalOAuth2ClientConfig:
    & Partial<OAuth2ClientConfig>
    & WithRedirectUri
    & WithScope,
): OAuth2Client {
  return new OAuth2Client({
    clientId: Deno.env.get("GITLAB_CLIENT_ID")!,
    clientSecret: Deno.env.get("GITLAB_CLIENT_SECRET")!,
    authorizationEndpointUri: "https://gitlab.com/oauth/authorize",
    tokenUri: "https://gitlab.com/oauth/token",
    ...additionalOAuth2ClientConfig,
  });
}

/**
 * Creates an OAuth 2.0 client with Google as the provider.
 *
 * Requires `--allow-env[=GOOGLE_CLIENT_ID,GOOGLE_CLIENT_SECRET]` permissions and environment variables:
 * 1. `GOOGLE_CLIENT_ID`
 * 2. `GOOGLE_CLIENT_SECRET`
 *
 * @param additionalOAuth2ClientConfig Requires `redirectUri` and `defaults.scope` properties.
 *
 * @example
 * ```ts
 * import { createGoogleOAuth2Client } from "https://deno.land/x/deno_kv_oauth@$VERSION/mod.ts";
 *
 * const oauth2Client = createGoogleOAuth2Client({
 *  redirectUri: "http://localhost:8000/callback",
 *  defaults: {
 *    scope: "https://www.googleapis.com/auth/userinfo.profile"
 *  }
 * });
 * ```
 *
 * @see {@link https://developers.google.com/identity/protocols/oauth2/web-server}
 */
export function createGoogleOAuth2Client(
  additionalOAuth2ClientConfig:
    & Partial<OAuth2ClientConfig>
    & WithRedirectUri
    & WithScope,
): OAuth2Client {
  return new OAuth2Client({
    clientId: Deno.env.get("GOOGLE_CLIENT_ID")!,
    clientSecret: Deno.env.get("GOOGLE_CLIENT_SECRET")!,
    authorizationEndpointUri: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUri: "https://oauth2.googleapis.com/token",
    ...additionalOAuth2ClientConfig,
  });
}

/**
 * Creates an OAuth 2.0 client with Notion as the provider.
 *
 * Requires `--allow-env[=NOTION_CLIENT_ID,NOTION_CLIENT_SECRET]` permissions and environment variables:
 * 1. `NOTION_CLIENT_ID`
 * 2. `NOTION_CLIENT_SECRET`
 *
 * @example
 * ```ts
 * import { createNotionOAuth2Client } from "https://deno.land/x/deno_kv_oauth@$VERSION/mod.ts";
 *
 * const oauth2Client = createNotionOAuth2Client();
 * ```
 *
 * @see {@link https://developers.notion.com/docs/authorization}
 */
export function createNotionOAuth2Client(
  additionalOAuth2ClientConfig?: Partial<OAuth2ClientConfig>,
): OAuth2Client {
  return new OAuth2Client({
    clientId: Deno.env.get("NOTION_CLIENT_ID")!,
    clientSecret: Deno.env.get("NOTION_CLIENT_SECRET")!,
    authorizationEndpointUri:
      "https://api.notion.com/v1/oauth/authorize?owner=user",
    tokenUri: "https://api.notion.com/v1/oauth/token",
    ...additionalOAuth2ClientConfig,
  });
}

/**
 * Creates an OAuth 2.0 client with Patreon as the provider.
 *
 * Requires `--allow-env[=PATREON_CLIENT_ID,PATREON_CLIENT_SECRET]` permissions and environment variables:
 * 1. `PATREON_CLIENT_ID`
 * 2. `PATREON_CLIENT_SECRET`
 *
 * @param additionalOAuth2ClientConfig Requires `redirectUri` and `defaults.scope` properties.
 *
 * @example
 * ```ts
 * import { createPatreonOAuth2Client } from "https://deno.land/x/deno_kv_oauth@$VERSION/mod.ts";
 *
 * const oauth2Client = createPatreonOAuth2Client({
 *  redirectUri: "http://localhost:8000/callback",
 *  defaults: {
 *    scope: "identity identity[email]"
 *  }
 * });
 * ```
 *
 * @see {@link https://www.patreon.com/portal/registration/register-clients}
 */
export function createPatreonOAuth2Client(
  additionalOAuth2ClientConfig:
    & Partial<OAuth2ClientConfig>
    & WithRedirectUri
    & WithScope,
): OAuth2Client {
  return new OAuth2Client({
    clientId: Deno.env.get("PATREON_CLIENT_ID")!,
    clientSecret: Deno.env.get("PATREON_CLIENT_SECRET")!,
    authorizationEndpointUri: "https://www.patreon.com/oauth2/authorize",
    tokenUri: "https://www.patreon.com/api/oauth2/token",
    ...additionalOAuth2ClientConfig,
  });
}

/**
 * Creates an OAuth 2.0 client with Slack as the provider.
 *
 * Requires `--allow-env[=SLACK_CLIENT_ID,SLACK_CLIENT_SECRET]` permissions and environment variables:
 * 1. `SLACK_CLIENT_ID`
 * 2. `SLACK_CLIENT_SECRET`
 *
 * @param additionalOAuth2ClientConfig Requires `defaults.scope` property.
 *
 * @example
 * ```ts
 * import { createSlackOAuth2Client } from "https://deno.land/x/deno_kv_oauth@$VERSION/mod.ts";
 *
 * const oauth2Client = createSlackOAuth2Client({
 *  redirectUri: "http://localhost:8000/callback",
 *  defaults: {
 *    scope: "users.profile:read"
 *  }
 * });
 * ```
 *
 * @see {@link https://api.slack.com/authentication/oauth-v2}
 */
export function createSlackOAuth2Client(
  additionalOAuth2ClientConfig: Partial<OAuth2ClientConfig> & WithScope,
): OAuth2Client {
  return new OAuth2Client({
    clientId: Deno.env.get("SLACK_CLIENT_ID")!,
    clientSecret: Deno.env.get("SLACK_CLIENT_SECRET")!,
    authorizationEndpointUri: "https://slack.com/oauth/v2/authorize",
    tokenUri: "https://slack.com/api/oauth.v2.access",
    ...additionalOAuth2ClientConfig,
  });
}

/**
 * Creates an OAuth 2.0 client with Twitter as the provider.
 *
 * Requires `--allow-env[=TWITTER_CLIENT_ID,TWITTER_CLIENT_SECRET]` permissions and environment variables:
 * 1. `TWITTER_CLIENT_ID`
 * 2. `TWITTER_CLIENT_SECRET`
 *
 * @param additionalOAuth2ClientConfig Requires `redirectUri` and `defaults.scope` properties.
 *
 * @example
 * ```ts
 * import { createTwitterOAuth2Client } from "https://deno.land/x/deno_kv_oauth@$VERSION/mod.ts";
 *
 * const oauth2Client = createTwitterOAuth2Client({
 *  redirectUri: "http://localhost:8000/callback",
 *  defaults: {
 *    scope: "users.read"
 *  }
 * });
 * ```
 *
 * @see {@link https://github.com/twitterdev/twitter-api-typescript-sdk}
 */
export function createTwitterOAuth2Client(
  additionalOAuth2ClientConfig:
    & Partial<OAuth2ClientConfig>
    & WithRedirectUri
    & WithScope,
): OAuth2Client {
  return new OAuth2Client({
    clientId: Deno.env.get("TWITTER_CLIENT_ID")!,
    clientSecret: Deno.env.get("TWITTER_CLIENT_SECRET")!,
    authorizationEndpointUri: "https://twitter.com/i/oauth2/authorize",
    tokenUri: "https://api.twitter.com/2/oauth2/token",
    ...additionalOAuth2ClientConfig,
  });
}

/**
 * Creates an OAuth 2.0 client with Spotify as the provider.
 *
 * Requires `--allow-env[=SPOTIFY_CLIENT_ID,SPOTIFY_CLIENT_SECRET]` permissions and environment variables:
 * 1. `SPOTIFY_CLIENT_ID`
 * 2. `SPOTIFY_CLIENT_SECRET`
 *
 * @param additionalOAuth2ClientConfig Requires `defaults.scope` property.
 *
 * @example
 * ```ts
 * import { createSpotifyOAuth2Client } from "https://deno.land/x/deno_kv_oauth@$VERSION/mod.ts";
 *
 * const oauth2Client = createSpotifyOAuth2Client({
 *  redirectUri: "http://localhost:8000/callback",
 *  defaults: {
 *    scope: "user-read-private user-read-email"
 *  }
 * });
 * ```
 *
 * @see {@link https://developer.spotify.com/documentation/web-api/tutorials/code-flow}
 */
export function createSpotifyOAuth2Client(
  additionalOAuth2ClientConfig:
    & Partial<OAuth2ClientConfig>
    & WithRedirectUri
    & WithScope,
): OAuth2Client {
  return new OAuth2Client({
    clientId: Deno.env.get("SPOTIFY_CLIENT_ID")!,
    clientSecret: Deno.env.get("SPOTIFY_CLIENT_SECRET")!,
    authorizationEndpointUri: "https://accounts.spotify.com/authorize",
    tokenUri: "https://accounts.spotify.com/api/token",
    ...additionalOAuth2ClientConfig,
  });
}
