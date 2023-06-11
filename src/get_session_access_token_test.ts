// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import { getSessionAccessToken } from "./get_session_access_token.ts";
import {
  assertEquals,
  assertRejects,
  OAuth2Client,
  SECOND,
  Tokens,
} from "../dev_deps.ts";
import { setTokensBySiteSession } from "./_core.ts";

Deno.test("getSessionAccessToken()", async () => {
  const oauth2Client = new OAuth2Client({
    clientId: crypto.randomUUID(),
    clientSecret: crypto.randomUUID(),
    authorizationEndpointUri: "https://example.com/auth",
    tokenUri: "https://example.com/token",
  });

  assertEquals(await getSessionAccessToken(oauth2Client, "nil"), null);

  const tokens: Tokens = {
    accessToken: crypto.randomUUID(),
    tokenType: "Bearer",
  };
  const sessionId = crypto.randomUUID();
  await setTokensBySiteSession(sessionId, tokens);
  assertEquals(
    await getSessionAccessToken(oauth2Client, sessionId),
    tokens.accessToken,
  );
  tokens.expiresIn = Date.now() + (30 * SECOND);
  tokens.refreshToken = crypto.randomUUID();
  await setTokensBySiteSession(sessionId, tokens);
  assertEquals(
    await getSessionAccessToken(oauth2Client, sessionId),
    tokens.accessToken,
  );

  tokens.expiresIn = 0;
  await setTokensBySiteSession(sessionId, tokens);
  assertRejects(async () =>
    await getSessionAccessToken(oauth2Client, sessionId)
  );
});
