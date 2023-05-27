import { MiddlewareHandlerContext } from "$fresh/server.ts";
import { createGitHubProvider, type Provider } from "deno_kv_oauth";

export interface State {
  provider: Provider;
}

export async function handler(
  req: Request,
  ctx: MiddlewareHandlerContext<State>,
) {
  // Don't process session-related data for keepalive and static requests
  if (new URL(req.url).pathname.startsWith("_frsh")) {
    return await ctx.next();
  }
  ctx.state.provider = createGitHubProvider();
  return await ctx.next();
}
