// Copyright 2023-2024 the Deno authors. All rights reserved. MIT license.
import { STATUS_CODE } from "./deps.ts";
import { createGitHubOAuthConfig, createHelpers } from "./mod.ts";

/**
 * Modify the OAuth configuration creation function when testing for providers.
 *
 * @example
 * ```ts
 * import { createNotionOAuthConfig } from "./mod.ts";
 *
 * const oauthConfig = createNotionOAuthConfig();
 * ```
 */
const oauthConfig = createGitHubOAuthConfig();
const { getSessionData, handleCallback, signIn, signOut } = createHelpers<
  GitHubUser
>(
  oauthConfig,
);

async function indexHandler(request: Request) {
  const sessionData = await getSessionData(request);
  const hasSessionIdCookie = sessionData !== null;

  const body = `
    <p>Authorization endpoint URI: ${oauthConfig.authorizationEndpointUri}</p>
    <p>Token URI: ${oauthConfig.tokenUri}</p>
    <p>Scope: ${oauthConfig.defaults?.scope}</p>
    <p>Signed in: ${hasSessionIdCookie}</p>
    <pre>${JSON.stringify(sessionData, null, 2)}</pre>
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

interface GitHubUser {
  login: string;
  avatarUrl: string;
}

async function getGitHubUser(accessToken: string) {
  const response = await fetch("https://api.github.com/user", {
    headers: {
      authorization: `token ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to get GitHub user");
  }

  const data = await response.json();
  return {
    login: data.login,
    avatarUrl: data.avatar_url,
  } as GitHubUser;
}

export async function handler(request: Request): Promise<Response> {
  if (request.method !== "GET") {
    return new Response(null, { status: STATUS_CODE.NotFound });
  }

  switch (new URL(request.url).pathname) {
    case "/": {
      return await indexHandler(request);
    }
    case "/signin": {
      return await signIn(request);
    }
    case "/callback": {
      try {
        return await handleCallback(
          request,
          getGitHubUser,
        );
      } catch {
        return new Response(null, { status: STATUS_CODE.InternalServerError });
      }
    }
    case "/signout": {
      return await signOut(request);
    }
    default: {
      return new Response(null, { status: STATUS_CODE.NotFound });
    }
  }
}

if (import.meta.main) {
  Deno.serve(handler);
}
