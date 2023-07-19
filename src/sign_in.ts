// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import { type OAuth2Client, setCookie } from "../deps.ts";
import {
  COOKIE_BASE,
  getCookieName,
  isSecure,
  OAUTH_COOKIE_NAME,
  redirect,
  setOAuthSession,
} from "./core.ts";

/**
 * Handles the sign-in process for a given OAuth 2.0 client and redirects the client to the authorization URL.
 *
 * It does this by:
 * 1. Using a randomly generated state to construct the OAuth 2.0 provider's authorization URL and code verifier.
 * 2. Storing an OAuth 2.0 session object that contains the state and code verifier in KV. The OAuth 2.0 session object will be used in the callback handler to get the OAuth 2.0 tokens from the given provider.
 * 3. Returning a response that sets the client's OAuth 2.0 session cookie and redirects the client to the OAuth 2.0 provider's authorization URL.
 *
 * @param request The HTTP request from the client.
 *
 * @example
 * ```ts
 * import { signIn, createGitHubOAuth2Client } from "https://deno.land/x/deno_kv_oauth@$VERSION/mod.ts";
 *
 * const oauth2Client = createGitHubOAuth2Client();
 *
 * export async function handleSignIn(request: Request) {
 *  return await signIn(request, oauth2Client);
 * }
 * ```
 */
export async function signIn(
  request: Request,
  oauth2Client: OAuth2Client,
  options?: { urlParams?: Record<string, string> },
): Promise<Response> {
  const state = crypto.randomUUID();
  const { uri, codeVerifier } = await getAuthorizationUri(oauth2Client, {
    state,
    ...options,
  });

  const oauthSessionId = crypto.randomUUID();
  await setOAuthSession(oauthSessionId, { state, codeVerifier });

  const response = redirect(uri.toString());
  setCookie(response.headers, {
    ...COOKIE_BASE,
    name: getCookieName(OAUTH_COOKIE_NAME, isSecure(request.url)),
    value: oauthSessionId,
    secure: isSecure(request.url),
    /**
     * A maximum authorization code lifetime of 10 minutes is recommended.
     * This cookie lifetime matches that value.
     *
     * @see {@link https://datatracker.ietf.org/doc/html/rfc6749#section-4.1.2}
     */
    maxAge: 10 * 60,
  });
  return response;
}

/**
 * Handles additional paramaters that will be appended to the authorization uri
 */
export async function getAuthorizationUri(
  oauth2Client: OAuth2Client,
  { urlParams, state }: { urlParams?: Record<string, string>; state: string },
) {
  const { uri, ...rest } = await oauth2Client.code.getAuthorizationUri({
    state,
  });

  if (urlParams) {
    Object.entries(urlParams).forEach(([key, value]) =>
      uri.searchParams.append(key, value)
    );
  }

  return { uri, ...rest };
}
