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
  signIn,
  signOut,
} from "./mod.ts";

loadSync({ export: true });

/** @todo(iuioiua) Simplify this demo and instead provide guidance on how to change the demo parameters. */

/**
 * Allows for dynamic provider selection useful for testing.
 * In production, just use import and use the provider's OAuth configuration creator.
 *
 * @example
 * ```ts
 * import { createGitHubOAuthConfig } from "https://deno.land/x/deno_kv_oauth@$VERSION/mod.ts";
 *
 * const oauthConfig = createGitHubOAuthConfig();
 * ```
 */
const provider = Deno.env.get("PROVIDER") ?? "GitHub";
const createOAuthConfigFn = {
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
}[provider];

if (createOAuthConfigFn === undefined) {
  throw new Error("Provider not found");
}

const redirectUri = Deno.env.get("DENO_DEPLOYMENT_ID") ??
  "http://localhost:8000/callback";
const scope = Deno.env.get("SCOPE")!;
if (!Deno.env.has("GITHUB_CLIENT_ID")) {
  Deno.env.set("GITHUB_CLIENT_ID", crypto.randomUUID());
}
if (!Deno.env.has("GITHUB_CLIENT_SECRET")) {
  Deno.env.set("GITHUB_CLIENT_SECRET", crypto.randomUUID());
}
const oauthConfig = createOAuthConfigFn(redirectUri, scope);

async function indexHandler(request: Request) {
  const sessionId = getSessionId(request);
  const hasSessionIdCookie = sessionId !== undefined;
  const accessToken = hasSessionIdCookie
    ? await getSessionAccessToken(oauthConfig, sessionId)
    : null;

  const accessTokenInnerText = accessToken !== null
    ? `<span style="filter:blur(3px)">${accessToken}</span> (intentionally blurred for security)`
    : accessToken;
  const body = `
    <p>Provider: ${provider}</p>
    <p>Scope: ${oauthConfig.defaults?.scope}</p>
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
      return await signIn(request, oauthConfig);
    }
    case "/callback": {
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
