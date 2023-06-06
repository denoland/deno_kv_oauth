// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import { assertEquals, type Tokens } from "../deps.ts";
import { getSessionTokens } from "./get_session_tokens.ts";
import { deleteTokensBySiteSession, setTokensBySiteSession } from "./_core.ts";

Deno.test("getSessionTokens()", async () => {
  const sessionId = crypto.randomUUID();
  const tokens: Tokens = {
    accessToken: crypto.randomUUID(),
    tokenType: crypto.randomUUID(),
  };
  await setTokensBySiteSession(sessionId, tokens);

  assertEquals(await getSessionTokens(sessionId), tokens);

  // Cleanup
  await deleteTokensBySiteSession(sessionId);
});
