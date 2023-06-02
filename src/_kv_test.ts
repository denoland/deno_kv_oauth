import { assertEquals, Tokens } from "../deps.ts";
import {
  deleteOAuthSession,
  deleteTokensBySiteSession,
  getOAuthSession,
  getTokensBySiteSession,
  type OAuthSession,
  setOAuthSession,
  setTokensBySiteSession,
} from "./_kv.ts";

Deno.test("getOAuthSession() + setOAuthSession() + deleteOAuthSession()", async () => {
  const id = crypto.randomUUID();

  // OAuth session doesn't yet exist
  assertEquals(await getOAuthSession(id), null);

  const oauthSession: OAuthSession = {
    state: crypto.randomUUID(),
    codeVerifier: crypto.randomUUID(),
  };
  await setOAuthSession(id, oauthSession);

  assertEquals(await getOAuthSession(id), oauthSession);

  await deleteOAuthSession(id);

  assertEquals(await getOAuthSession(id), null);
});

Deno.test("getTokensBySiteSession() + setTokensBySiteSession() + deleteTokensBySiteSession()", async () => {
  const id = crypto.randomUUID();

  // Tokens don't yet exist
  assertEquals(await getTokensBySiteSession(id), null);

  const tokens: Tokens = {
    accessToken: crypto.randomUUID(),
    tokenType: crypto.randomUUID(),
  };
  await setTokensBySiteSession(id, tokens);

  assertEquals(await getTokensBySiteSession(id), tokens);

  await deleteTokensBySiteSession(id);

  assertEquals(await getTokensBySiteSession(id), null);
});
