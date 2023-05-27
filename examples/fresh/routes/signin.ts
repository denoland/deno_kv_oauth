import { Handlers } from "$fresh/server.ts";
import { signIn } from "deno_kv_oauth";
import { State } from "./_middleware.ts";

// deno-lint-ignore no-explicit-any
export const handler: Handlers<any, State> = {
  async GET(_req, ctx) {
    return await signIn(ctx.state.provider);
  },
};
