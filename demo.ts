// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import "https://deno.land/std@0.190.0/dotenv/load.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Status } from "https://deno.land/std@0.190.0/http/http_status.ts";
import {
  createClient,
  getSessionId,
  getSessionTokens,
  handleCallback,
  signIn,
  signOut,
} from "https://deno.land/x/deno_kv_oauth@v0.1.6-beta/mod.ts";

const client = createClient("github");

async function indexHandler(request: Request) {
  let body = `
    <p>Who are you?</p>
    <p><a href="/signin">Sign in with GitHub</a></p>
  `;
  const sessionId = getSessionId(request);
  if (sessionId !== null) {
    const tokens = await getSessionTokens(sessionId);
    body = `
      <p>Your tokens:<p>
      <pre>${JSON.stringify(tokens, undefined, 2)}</pre>
      <a href="/signout">Sign out</a>
    `;
  }
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
