import { Handlers } from "$fresh/server.ts";
import { State } from "./_middleware.ts";

// deno-lint-ignore no-explicit-any
export const handler: Handlers<any, State> = {
  async GET(_req, ctx) {
    return await ctx.state.kvOAuthClient.handleCallback("/");
  },
};
