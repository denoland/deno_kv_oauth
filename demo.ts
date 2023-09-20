// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import { loadSync, Status } from "./dev_deps.ts";
import {
  createGitHubOAuthConfig,
  getSessionAccessToken,
  getSessionId,
  handleCallback,
  signIn,
  signOut,
} from "./mod.ts";

loadSync({ export: true });

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
    <p>Authorization endpoint URI: ${oauthConfig.authorizationEndpointUri}</p>
    <p>Token URI: ${oauthConfig.tokenUri}</p>
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
