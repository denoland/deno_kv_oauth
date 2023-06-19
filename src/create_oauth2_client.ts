// Copyright 2023 the Deno authors. All rights reserved. MIT license.

// For providers that have OAuth 2.0 configuration requirements
export type WithScope = { defaults: { scope: string | string[] } };
export type WithRedirectUri = { redirectUri: string };

export { createDiscordOAuth2Client } from "./providers/discord.ts";
export { createDropboxOAuth2Client } from "./providers/dropbox.ts";
export { createGitHubOAuth2Client } from "./providers/github.ts";
export { createFacebookOAuth2Client } from "./providers/facebook.ts";
export { createGitLabOAuth2Client } from "./providers/gitlab.ts";
export { createGoogleOAuth2Client } from "./providers/google.ts";
export { createNotionOAuth2Client } from "./providers/notion.ts";
export { createPatreonOAuth2Client } from "./providers/patreon.ts";
export { createSlackOAuth2Client } from "./providers/slack.ts";
export { createTwitterOAuth2Client } from "./providers/twitter.ts";
