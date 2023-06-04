// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import {
  createClient,
  getSessionTokens,
  handleCallback,
  isSignedIn,
  signIn,
  signOut,
} from "./mod.ts";
import { loadSync, serve, Status } from "./deps.ts";

loadSync({ export: true });

const client = createClient("github");

async function indexHandler(request: Request) {
  let body = `
    <p>Who are you?</p>
    <p><a href="/signin">Sign in with GitHub</a></p>
  `;
  if (isSignedIn(request)) {
    const tokens = await getSessionTokens(request);
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
      return await handleCallback(request, client);
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
