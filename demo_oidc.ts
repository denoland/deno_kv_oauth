// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import { loadSync, OIDCClient, Status } from "./dev_deps.ts";
import {
  clearOAuthSessionsAndTokens,
  getSessionAccessToken,
  getSessionId,
  handleCallback,
  signIn,
  signOut,
} from "./mod.ts";
import {
  createRemoteJWKSet,
  jwtVerify,
} from "https://deno.land/x/jose@v4.14.4/index.ts";

loadSync({ export: true });

await clearOAuthSessionsAndTokens();

const jwks = createRemoteJWKSet(
  new URL("https://www.googleapis.com/oauth2/v3/certs"),
);

const oauth2Client = new OIDCClient({
  clientId: Deno.env.get("GOOGLE_CLIENT_ID")!,
  clientSecret: Deno.env.get("GOOGLE_CLIENT_SECRET")!,
  authorizationEndpointUri: "https://accounts.google.com/o/oauth2/v2/auth",
  tokenUri: "https://oauth2.googleapis.com/token",
  redirectUri: "http://localhost:8000/callback",
  verifyJwt: (jwt) => jwtVerify(jwt, jwks),
  defaults: {
    scope: "openid",
  },
});

async function indexHandler(request: Request) {
  const sessionId = getSessionId(request);
  const hasSessionIdCookie = sessionId !== undefined;
  const accessToken = hasSessionIdCookie
    ? await getSessionAccessToken(oauth2Client, sessionId)
    : null;

  const accessTokenInnerText = accessToken !== null
    ? `<span style="filter:blur(3px)">${accessToken}</span> (intentionally blurred for security)`
    : accessToken;
  const body = `
    <p>Scope: ${oauth2Client.config.defaults?.scope}</p>
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
  Deno.serve(handler);
}
