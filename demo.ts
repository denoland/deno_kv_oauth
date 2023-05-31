import { getUser, handleCallback, isSignedIn, signIn, signOut } from "./mod.ts";
import { loadSync, Status } from "./deps.ts";

loadSync({ export: true });

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
      const user = await getUser(request, "github");
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
    return await signIn("github");
  }

  if (pathname === "/callback") {
    return await handleCallback(request, "github");
  }

  if (pathname === "/signout") {
    return signOut(request);
  }

  return new Response(null, { status: Status.NotFound });
}

Deno.serve(handler);
