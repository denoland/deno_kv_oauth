import "https://deno.land/std@0.189.0/dotenv/load.ts";
import { Status } from "https://deno.land/std@0.189.0/http/http_status.ts";
import { createKvOAuthClient } from "../../mod.ts";

async function handler(req: Request): Promise<Response> {
  if (req.method !== "GET") {
    return new Response(null, { status: Status.NotFound });
  }

  const { pathname } = new URL(req.url);
  const kvOAuthClient = createKvOAuthClient(req);

  if (pathname === "/") {
    let body = `
      <p>Who are you?</p>
      <a href="/signin">Sign in</a>
    `;
    if (kvOAuthClient.isSignedIn()) {
      const user = await kvOAuthClient.getUser();
      body = `
        <p>Hello, ${user.login}!</p>
        <a href="/signout">Sign out</a>
      `;
    }
    return new Response(body, {
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }

  if (pathname === "/signin") {
    return await kvOAuthClient.signIn();
  }

  if (pathname === "/callback") {
    return await kvOAuthClient.handleCallback("/");
  }

  if (pathname === "/signout") {
    return await kvOAuthClient.signOut("/");
  }

  return new Response(null, { status: Status.NotFound });
}

Deno.serve(handler);
