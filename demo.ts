import {
  getSessionTokens,
  handleCallback,
  isSignedIn,
  signIn,
  signOut,
} from "./mod.ts";
import { loadSync, serve, Status } from "./deps.ts";

loadSync({ export: true });

async function indexHandler(request: Request) {
  let body = `
    <p>Who are you?</p>
    <p><a href="/signin/github">Sign in with GitHub</a></p>
    <p><a href="/signin/discord">Sign in with Discord</a></p>
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

const router: Record<string, (request: Request) => Promise<Response>> = {
  "/": (request) => indexHandler(request),
  "/signin/discord": (request) => signIn(request, "discord", "identify"),
  "/callback/discord": (request) => handleCallback(request, "discord"),
  "/signin/github": (request) => signIn(request, "github"),
  "/callback/github": (request) => handleCallback(request, "github"),
  "/signout": (request) => signOut(request),
};

async function handler(request: Request): Promise<Response> {
  if (request.method !== "GET") {
    return new Response(null, { status: Status.NotFound });
  }

  const { pathname } = new URL(request.url);
  const handler = router[pathname];
  return await handler?.(request) ??
    new Response(null, { status: Status.NotFound });
}

serve(handler);
