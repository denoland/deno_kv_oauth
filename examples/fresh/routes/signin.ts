import { Handlers } from "$fresh/server.ts";
import { signIn } from "deno_kv_oauth";

export const handler: Handlers = {
  async GET(_req) {
    return await signIn("github");
  },
};
