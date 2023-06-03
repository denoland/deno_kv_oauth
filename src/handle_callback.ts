// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import { assert, type OAuth2Client } from "../deps.ts";
import { getOAuthCookie, setSiteCookie } from "./_cookies.ts";
import { redirect } from "./_http.ts";
import {
  deleteOAuthSession,
  getOAuthSession,
  setTokensBySiteSession,
} from "./_kv.ts";

export async function handleCallback(
  request: Request,
  oauth2Client: OAuth2Client,
  redirectUrl = "/",
): Promise<Response> {
  // Get the OAuth session ID from the client's cookie and ensure it's defined
  const oauthSessionId = getOAuthCookie(request);
  assert(oauthSessionId, `OAuth cookie not found`);

  // Get the OAuth session object stored in Deno KV and ensure it's defined
  const oauthSession = await getOAuthSession(oauthSessionId);
  assert(oauthSession, `OAuth session ${oauthSessionId} entry not found`);

  // Clear the stored OAuth session now that's no longer needed
  await deleteOAuthSession(oauthSessionId);

  // Generate a random site session ID for the new user cookie
  const siteSessionId = crypto.randomUUID();
  const tokens = await oauth2Client.code.getToken(
    request.url,
    oauthSession,
  );
  await setTokensBySiteSession(siteSessionId, tokens);

  const response = redirect(redirectUrl);
  setSiteCookie(response.headers, request.url, siteSessionId);
  return response;
}
