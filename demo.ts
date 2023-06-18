// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import "https://deno.land/std@0.192.0/dotenv/load.ts";
import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { Status } from "https://deno.land/std@0.192.0/http/http_status.ts";
// Replace with https://deno.land/x/deno_kv_oauth@VERSION/mod.ts
import {
  createGitHubOAuth2Client,
  getSessionAccessToken,
  getSessionId,
  handleCallback,
  signIn,
  signOut,
} from "./mod.ts";

const oauth2Client = createGitHubOAuth2Client();

async function indexHandler(request: Request) {
  const sessionId = await getSessionId(request);
  const data = sessionId !== null
    ? {
      accessToken: await getSessionAccessToken(oauth2Client, sessionId),
      action: "out",
    }
    : {
      accessToken: "undefined",
      action: "in",
    };

  const body = `
    <p>Your access token: ${data.accessToken}</p>
    <p><a href="/sign${data.action}">Sign ${data.action}</a></p>
  `;

  return new Response(body, {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

export async function handler(request: Request): Promise<Response> {
  if (request.method !== "GET") {
    return new Response(null, { status: Status.NotFound });
  }

  const { pathname } = new URL(request.url);
  switch (pathname) {
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

serve(handler);
