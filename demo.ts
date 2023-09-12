// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import { loadSync, Status } from "./dev_deps.ts";
import {
  createAuth0OAuthConfig,
  createDiscordOAuthConfig,
  createDropboxOAuthConfig,
  createFacebookOAuthConfig,
  createGitHubOAuthConfig,
  createGitLabOAuthConfig,
  createGoogleOAuthConfig,
  createNotionOAuthConfig,
  createOktaOAuthConfig,
  createPatreonOAuthConfig,
  createSlackOAuthConfig,
  createSpotifyOAuthConfig,
  createTwitterOAuthConfig,
  getSessionAccessToken,
  getSessionId,
  handleCallback,
  type OAuthConfig,
  type OAuthUserConfig,
  signIn,
  signOut,
} from "./mod.ts";

loadSync({ export: true });

type CreateOAuthConfigFn = (config: OAuthUserConfig) => OAuthConfig;

const providers: Record<string, CreateOAuthConfigFn> = {
  Auth0: createAuth0OAuthConfig,
  Discord: createDiscordOAuthConfig,
  Dropbox: createDropboxOAuthConfig,
  Facebook: createFacebookOAuthConfig,
  GitHub: createGitHubOAuthConfig,
  GitLab: createGitLabOAuthConfig,
  Google: createGoogleOAuthConfig,
  Notion: createNotionOAuthConfig,
  Okta: createOktaOAuthConfig,
  Patreon: createPatreonOAuthConfig,
  Slack: createSlackOAuthConfig,
  Spotify: createSpotifyOAuthConfig,
  Twitter: createTwitterOAuthConfig,
};

/**
 * Allows for dynamic provider selection useful for testing.
 * In production, just use import and use the provider's OAuth 2.0 config creator.
 *
 * @example
 * ```ts
 * import { createGitHubOAuthConfig } from "https://deno.land/x/deno_kv_oauth@$VERSION/src/providers/github.ts";
 *
 * const oauthConfig = createGitHubOAuthConfig({
 *   redirectUri: "/callback"
 * });
 * ```
 */
function getOAuthConfig() {
  const provider = Deno.env.get("PROVIDER") ?? "GitHub";

  const createOAuthConfigFn = providers[provider];

  if (!createOAuthConfigFn) {
    throw new Error("Provider not found");
  }

  const oauthConfig = createOAuthConfigFn({
    redirectUri: "/callback",
  });

  if (Deno.env.has("SCOPE")) {
    oauthConfig.scope = Deno.env.get("SCOPE")!.split(/\s+/);
  }

  return oauthConfig;
}

async function indexHandler(request: Request) {
  const oauthConfig = getOAuthConfig();
  const sessionId = getSessionId(request);
  const hasSessionIdCookie = sessionId !== undefined;
  const accessToken = hasSessionIdCookie
    ? await getSessionAccessToken(oauthConfig, sessionId)
    : null;

  const accessTokenInnerText = accessToken !== null
    ? `<span style="filter:blur(3px)">${accessToken}</span> (intentionally blurred for security)`
    : accessToken;

  const body = `
    <p>Provider: ${oauthConfig.name}</p>
    <p>Scope: ${oauthConfig.scope}</p>
    <p>Signed in: ${hasSessionIdCookie}</p>
    <p>Your access token: ${accessTokenInnerText}</p>
    <p>
      <a href="/signin">Sign in</a>
    </p>
    <p>
      <a href="/signout">Sign out</a>
    </p>
    <p>
      <a href="https://deno.land/x/deno_kv_oauth/demo.ts?source">Source code</a>
    </p>
  `;

  return new Response(body, {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

export async function handler(request: Request): Promise<Response> {
  if (request.method !== "GET") {
    return new Response(null, { status: Status.NotFound });
  }

  switch (new URL(request.url).pathname) {
    case "/": {
      return await indexHandler(request);
    }
    case "/signin": {
      const oauthConfig = getOAuthConfig();
      return await signIn(request, oauthConfig);
    }
    case "/callback": {
      const oauthConfig = getOAuthConfig();
      try {
        const { response } = await handleCallback(request, oauthConfig);
        return response;
      } catch {
        return new Response(null, { status: Status.InternalServerError });
      }
    }
    case "/signout": {
      return await signOut(request);
    }
    default: {
      return new Response(null, { status: Status.NotFound });
    }
  }
}

if (import.meta.main) {
  Deno.serve(handler);
}
