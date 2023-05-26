import { MiddlewareHandlerContext } from "$fresh/server.ts";
import { createKvOAuthClient } from "deno_kv_oauth";

export interface State {
  kvOAuthClient: ReturnType<typeof createKvOAuthClient>;
}

export async function handler(
  req: Request,
  ctx: MiddlewareHandlerContext<State>,
) {
  // Don't process session-related data for keepalive and static requests
  if (new URL(req.url).pathname.includes("_frsh")) {
    return await ctx.next();
  }
  ctx.state.kvOAuthClient = createKvOAuthClient(req);
  return await ctx.next();
}
