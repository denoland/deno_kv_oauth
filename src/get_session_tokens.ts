// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import { getTokensBySiteSession } from "./_core.ts";

export async function getSessionTokens(sessionId: string) {
  return await getTokensBySiteSession(sessionId);
}
