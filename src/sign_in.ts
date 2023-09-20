// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import { OAuth2Client, OAuth2ClientConfig, setCookie } from "../deps.ts";
import {
  COOKIE_BASE,
  getCookieName,
  getSuccessUrl,
  isSecure,
  OAUTH_COOKIE_NAME,
  redirect,
  setOAuthSession,
} from "./core.ts";

/**
 * Handles the sign-in process for the given OAuth configuration and redirects the client to the authorization URL.
 *
 * It does this by:
 * 1. Using a randomly generated state to construct the OAuth 2.0 provider's authorization URL and code verifier.
 * 2. Storing an OAuth 2.0 session object that contains the state and code verifier in KV. The OAuth 2.0 session object will be used in the callback handler to get the OAuth 2.0 tokens from the given provider and define the success URL.
 * 3. Returning a response that sets the client's OAuth 2.0 session cookie and redirects the client to the OAuth 2.0 provider's authorization URL.
 *
 * See "Redirect URL after Sign-In or Sign-Out" section in the README for more information on the success URL.
 *
 * @param request The HTTP request from the client.
 *
 * @example
 * ```ts
 * import { signIn, createGitHubOAuthConfig } from "https://deno.land/x/deno_kv_oauth@$VERSION/mod.ts";
 *
 * const oauthConfig = createGitHubOAuthConfig();
 *
 * export async function handleSignIn(request: Request) {
 *  return await signIn(request, oauthConfig);
 * }
 * ```
 */
export async function signIn(
  request: Request,
  /** @see {@linkcode OAuth2ClientConfig} */
  oauthConfig: OAuth2ClientConfig,
  options?: {
    /** These parameters will be appended to the authorization URI, if defined. */
    urlParams?: Record<string, string>;
  },
): Promise<Response> {
  const state = crypto.randomUUID();
  const { uri, codeVerifier } = await new OAuth2Client(oauthConfig)
    .code.getAuthorizationUri({ state });

  if (options?.urlParams) {
    Object.entries(options.urlParams).forEach(([key, value]) =>
      uri.searchParams.append(key, value)
    );
  }

  const oauthSessionId = crypto.randomUUID();
  const successUrl = getSuccessUrl(request);
  await setOAuthSession(oauthSessionId, { state, codeVerifier, successUrl });

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
