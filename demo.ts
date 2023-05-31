import "https://deno.land/std@0.189.0/dotenv/load.ts";
import { Status } from "https://deno.land/std@0.189.0/http/http_status.ts";
import {
  createGitHubProvider,
  getUser,
  handleCallback,
  isSignedIn,
  signIn,
  signOut,
} from "./mod.ts";

const provider = createGitHubProvider();

async function handler(request: Request): Promise<Response> {
  if (request.method !== "GET") {
    return new Response(null, { status: Status.NotFound });
  }

  const { pathname } = new URL(request.url);

  if (pathname === "/") {
    let body = `
      <p>Who are you?</p>
      <a href="/signin">Sign in</a>
    `;
    if (isSignedIn(request)) {
      const user = await getUser(request, provider);
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
    return await signIn(provider);
  }

  if (pathname === "/callback") {
    return await handleCallback(request, provider);
  }

  if (pathname === "/signout") {
    return signOut(request);
  }

  return new Response(null, { status: Status.NotFound });
}

Deno.serve(handler);
