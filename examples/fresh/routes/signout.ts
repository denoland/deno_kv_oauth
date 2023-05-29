import { Handlers } from "$fresh/server.ts";
import { signOut } from "deno_kv_oauth";

export const handler: Handlers = {
  async GET(req) {
    return await signOut(req);
  },
};
