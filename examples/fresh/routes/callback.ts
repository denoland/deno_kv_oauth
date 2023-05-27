import { Handlers } from "$fresh/server.ts";
import { handleCallback } from "deno_kv_oauth";
import { State } from "./_middleware.ts";

// deno-lint-ignore no-explicit-any
export const handler: Handlers<any, State> = {
  async GET(req, ctx) {
    return await handleCallback(req, ctx.state.provider);
  },
};
