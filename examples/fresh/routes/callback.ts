import { Handlers } from "$fresh/server.ts";
import { handleCallback } from "deno_kv_oauth";

export const handler: Handlers = {
  async GET(req) {
    return await handleCallback(req, "github");
  },
};
