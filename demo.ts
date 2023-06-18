// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import "https://deno.land/std@0.192.0/dotenv/load.ts";
import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { Status } from "https://deno.land/std@0.192.0/http/http_status.ts";
import {
  createGitHubOAuth2Client,
  getSessionAccessToken,
  getSessionId,
  handleCallback,
  signIn,
  signOut,
} from "https://deno.land/x/deno_kv_oauth@$VERSION/mod.ts";

const oauth2Client = createGitHubOAuth2Client();

async function indexHandler(request: Request) {
  const sessionId = await getSessionId(request);
  const isSignedIn = sessionId !== null;
  const accessToken = isSignedIn
    ? await getSessionAccessToken(oauth2Client, sessionId)
    : null;

  const body = `
    <p>Signed in: ${isSignedIn}</p>
    <p>Your access token: ${accessToken}</p>
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
  await serve(handler);
}
