// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import { loadSync, OIDCClient, Status } from "./dev_deps.ts";
import {
  getSessionAccessToken,
  getSessionId,
  handleCallback,
  signIn,
  signOut,
} from "./mod.ts";
import { jwtVerify } from "https://deno.land/x/jose@v4.14.4/index.ts";

loadSync({ export: true });

const { publicKey } = await crypto.subtle.generateKey(
  {
    name: "RSASSA-PKCS1-v1_5",
    hash: "SHA-256", // SHA-1, SHA-256, SHA-384, or SHA-512
    publicExponent: new Uint8Array([1, 0, 1]), // 0x03 or 0x010001
    modulusLength: 2048, // 1024, 2048, or 4096
  },
  false,
  ["sign", "verify"],
);

const oauth2Client = new OIDCClient({
  clientId: Deno.env.get("GOOGLE_CLIENT_ID")!,
  clientSecret: Deno.env.get("GOOGLE_CLIENT_SECRET")!,
  authorizationEndpointUri: "https://accounts.google.com/o/oauth2/v2/auth",
  tokenUri: "https://oauth2.googleapis.com/token",
  redirectUri: "http://localhost:8000/callback",
  verifyJwt: (jwt) => jwtVerify(jwt, publicKey),
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
