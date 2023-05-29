import { Handlers } from "$fresh/server.ts";
import { signIn } from "deno_kv_oauth";
import { provider } from "@/utils/provider.ts";

export const handler: Handlers = {
  async GET(_req) {
    return await signIn(provider);
  },
};
