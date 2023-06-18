// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import "https://deno.land/std@0.192.0/dotenv/load.ts";
import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { Status } from "https://deno.land/std@0.192.0/http/http_status.ts";

import {
  getSessionAccessToken,
  getSessionId,
  handleCallback,
  signIn,
  signOut,
} from "../mod.ts";
import { OAuth2Client } from "../deps.ts";

/**
 * The redirect URI to use for the demo.
 */
export const redirectUri = "http://localhost:8000/callback";

/**
 * Test an OAuth2Client by running a demo.
 *
 * @param withAccessToken Optional function that will be called with the access token
 */
export function runDemo(
  oauth2Client: OAuth2Client,
  demoName: string,
  withAccessToken?: (accessToken: string) => Promise<string>,
) {
  const indexHandler = async (request: Request, blur = false) => {
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

    let body = `
      <h1>Deno KV Oauth Demo: ${demoName}</h1>
      <p><b>Your access token:</b> <span style="${
      blur ? "filter:blur(3px)" : ""
    }">${data.accessToken}</span></p>
    `;

    if (
      data.accessToken && data.accessToken !== "undefined" && withAccessToken
    ) {
      body += await withAccessToken(data.accessToken);
    }

    body += `
      <p><a href="/sign${data.action}">Sign ${data.action}</a></p>
      <p><a href="/${blur ? "" : "?blur"}">${
      blur ? "Show" : "Blur"
    } token</a></p>
    `;

    return new Response(body, {
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  };

  const handler = async (request: Request): Promise<Response> => {
    if (request.method !== "GET") {
      return new Response(null, { status: Status.NotFound });
    }

    const { pathname, search } = new URL(request.url);
    switch (pathname) {
      case "/": {
        return await indexHandler(request, search === "?blur");
      }
      case "/signin": {
        return await signIn(request, oauth2Client);
      }
      case "/callback": {
        const { response } = await handleCallback(request, oauth2Client);
        return response;
      }
      case "/signout": {
        return await signOut(request);
      }
      default: {
        return new Response(null, { status: Status.NotFound });
      }
    }
  };

  serve(handler);
}
