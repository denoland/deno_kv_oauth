// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import "https://deno.land/std@0.191.0/dotenv/load.ts";
import { serve } from "https://deno.land/std@0.191.0/http/server.ts";
import { Status } from "https://deno.land/std@0.191.0/http/http_status.ts";
// Replace with https://deno.land/x/deno_kv_oauth@VERSION/mod.ts
import {
  createClient,
  getSessionAccessToken,
  getSessionId,
  handleCallback,
  signIn,
  signOut,
} from "./mod.ts";

const client = createClient("twitter", {
  redirectUri: "http://localhost:8000/callback",
  defaults: { scope: "users.read" },
});

async function indexHandler(request: Request) {
  const sessionId = getSessionId(request);
  const accessToken = sessionId !== null
    ? await getSessionAccessToken(client, sessionId)
    : "undefined";
  const action = sessionId !== undefined ? "in" : "out";

  const body = `
    <p>Your access token: ${accessToken}</p>
    <p><a href="/sign${action}">Sign ${action}</a></p>
  `;

  return new Response(body, {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

async function handler(request: Request): Promise<Response> {
  if (request.method !== "GET") {
    return new Response(null, { status: Status.NotFound });
  }

  const { pathname } = new URL(request.url);
  switch (pathname) {
    case "/": {
      return await indexHandler(request);
    }
    case "/signin": {
      return await signIn(request, client);
    }
    case "/callback": {
      const { response } = await handleCallback(request, client);
      return response;
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
