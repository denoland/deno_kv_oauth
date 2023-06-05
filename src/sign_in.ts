// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import { type OAuth2Client, setCookie } from "../deps.ts";
import {
  COOKIE_BASE,
  getCookieName,
  isSecure,
  OAUTH_COOKIE_NAME,
  redirect,
  setOAuthSession,
} from "./_core.ts";

export async function signIn(
  request: Request,
  oauth2Client: OAuth2Client,
): Promise<Response> {
  // Generate a random state
  const state = crypto.randomUUID();
  // Use that state to generate the authorization URI
  const { uri, codeVerifier } = await oauth2Client.code
    .getAuthorizationUri({ state });

  // Store the OAuth session object (state and PKCE code verifier) in Deno KV
  const oauthSessionId = crypto.randomUUID();
  await setOAuthSession(oauthSessionId, { state, codeVerifier });

  // Store the ID of that OAuth session object in a client cookie
  const response = redirect(uri.toString());
  setCookie(
    response.headers,
    {
      ...COOKIE_BASE,
      name: getCookieName(OAUTH_COOKIE_NAME, isSecure(request.url)),
      value: oauthSessionId,
      secure: isSecure(request.url),
    },
  );
  return response;
}
