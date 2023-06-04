// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import { assert } from "../deps.ts";
import { getSiteCookie } from "./_cookies.ts";
import { getTokensBySiteSession } from "./_kv.ts";

export async function getSessionTokens(request: Request) {
  const siteSessionId = getSiteCookie(request);
  assert(siteSessionId, `Site cookie not found`);

  const tokens = await getTokensBySiteSession(siteSessionId);
  assert(tokens, `Tokens by site session ID ${siteSessionId} not found`);

  return tokens;
}
