// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import {
  loadSync,
  type OAuth2ClientConfig,
  serve,
  Status,
} from "./dev_deps.ts";
import {
  createDiscordOAuth2Client,
  createDropboxOAuth2Client,
  createFacebookOAuth2Client,
  createGitHubOAuth2Client,
  createGitLabOAuth2Client,
  createGoogleOAuth2Client,
  createNotionOAuth2Client,
  createPatreonOAuth2Client,
  createSlackOAuth2Client,
  createTwitterOAuth2Client,
  getSessionAccessToken,
  getSessionId,
  handleCallback,
  signIn,
  signOut,
} from "./mod.ts";

loadSync({ export: true });

/**
 * Allows for dynamic provider selection useful for testing.
 * In production, just use import and use the provider's OAuth 2.0 client creator.
 *
 * @example
 * ```ts
 * import { createGitHubOAuth2Client } from "https://deno.land/x/deno_kv_oauth@$VERSION/mod.ts";
 *
 * const oauth2Client = createGitHubOAuth2Client();
 * ```
 */
const provider = Deno.env.get("PROVIDER") ?? "GitHub";
const createOAuth2ClientFn = {
  Discord: createDiscordOAuth2Client,
  Dropbox: createDropboxOAuth2Client,
  Facebook: createFacebookOAuth2Client,
  GitHub: createGitHubOAuth2Client,
  GitLab: createGitLabOAuth2Client,
  Google: createGoogleOAuth2Client,
  Notion: createNotionOAuth2Client,
  Patreon: createPatreonOAuth2Client,
  Slack: createSlackOAuth2Client,
  Twitter: createTwitterOAuth2Client,
}[provider];

if (createOAuth2ClientFn === undefined) {
  throw new Error("Provider not found");
}

const additionalOAuth2ClientConfig: Partial<OAuth2ClientConfig> = {
  redirectUri: Deno.env.get("DENO_DEPLOYMENT_ID") ??
    "http://localhost:8000/callback",
  defaults: {
    scope: Deno.env.get("SCOPE"),
  },
};

// @ts-ignore Trust me
const oauth2Client = createOAuth2ClientFn(additionalOAuth2ClientConfig);

async function indexHandler(request: Request) {
  const sessionId = await getSessionId(request);
  const isSignedIn = sessionId !== null;
  const accessToken = isSignedIn
    ? await getSessionAccessToken(oauth2Client, sessionId)
    : null;

  const accessTokenInnerText = accessToken !== null
    ? `Your access token (intentionally blurred but copyable): <span style="filter:blur(3px)">${accessToken}</span>`
    : `Your access token: ${accessToken}`;
  const body = `
    <p>Provider: ${provider}</p>
    <p>Signed in: ${isSignedIn}</p>
    <p>${accessTokenInnerText}</p>
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
      return await signIn(request, oauth2Client);
    }
    case "/callback": {
      try {
        const { response } = await handleCallback(request, oauth2Client);
        return response;
      } catch (error) {
        console.error(error);
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
  await serve(handler);
}
