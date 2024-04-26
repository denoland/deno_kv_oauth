// Copyright 2023-2024 the Deno authors. All rights reserved. MIT license.
import { STATUS_CODE } from "@std/http";
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
const { getSessionId, signIn, signOut, handleCallback } = createHelpers(
  oauthConfig,
);

async function indexHandler(request: Request) {
  const sessionId = await getSessionId(request);
  const hasSessionIdCookie = sessionId !== undefined;

  const body = `
    <p>Authorization endpoint URI: ${oauthConfig.authorizationEndpointUri}</p>
    <p>Token URI: ${oauthConfig.tokenUri}</p>
    <p>Scope: ${oauthConfig.defaults?.scope}</p>
    <p>Signed in: ${hasSessionIdCookie}</p>
    <p>
      <a href="/signin">Sign in</a>
    </p>
    <p>
      <a href="/signout">Sign out</a>
    </p>
    <p>
      <a href="https://github.com/denoland/deno_kv_oauth/blob/main/demo.ts">Source code</a>
    </p>
  `;

  return new Response(body, {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
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
        const { response } = await handleCallback(request);
        return response;
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
