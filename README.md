# Deno KV OAuth

[![Docs](https://doc.deno.land/badge.svg)](https://doc.deno.land/https://deno.land/x/deno_kv_oauth/mod.ts)
[![CI](https://github.com/denoland/deno_kv_oauth/actions/workflows/ci.yml/badge.svg)](https://github.com/denoland/deno_kv_oauth/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/denoland/deno_kv_oauth/branch/main/graph/badge.svg?token=UZ570U128Z)](https://codecov.io/gh/denoland/deno_kv_oauth)

Minimal OAuth powered by Deno KV.

> Note: this project is in beta. API design and functionality are subject to
> change.

## Getting Started

```ts
// deno run --unstable --allow-env --allow-net demo.ts
import {
  createClient,
  getSessionId,
  getSessionTokens,
  handleCallback,
  signIn,
  signOut,
} from "https://deno.land/x/deno_kv_oauth/mod.ts";
import { serve, Status } from "https://deno.land/std/http/mod.ts";

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
```

You can also check out a live demo at https://kv-oauth.deno.com.

## Contributing

Before submitting a pull request, please run `deno task ok` and ensure all
checks pass. This checks formatting, linting, types and runs tests.
