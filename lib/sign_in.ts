// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import {
  Cookie,
  OAuth2Client,
  type OAuth2ClientConfig,
  SECOND,
  setCookie,
} from "../deps.ts";
import {
  COOKIE_BASE,
  getCookieName,
  getDomain,
  getSuccessUrl,
  isSecure,
  OAUTH_COOKIE_NAME,
  redirect,
} from "./_http.ts";
import { setOAuthSession } from "./_kv.ts";

export interface SignInOptions {
  /** URL parameters that are appended to the authorization URI, if defined. */
  urlParams?: Record<string, string>;
}

/**
 * Handles the sign-in process for the given OAuth configuration and redirects
 * the client to the authorization URL.
 *
 * It does this by:
 * 1. Using a randomly generated state to construct the OAuth provider's
 * authorization URL and code verifier.
 * 2. Storing an OAuth session object that contains the state and code verifier
 * in KV. The OAuth session object will be used in the callback handler to get
 * the OAuth tokens from the given provider and define the success URL.
 * 3. Returning a response that sets the client's OAuth session cookie and
 * redirects the client to the OAuth provider's authorization URL.
 *
 * See "Redirect URL after Sign-In or Sign-Out" section in the README for more
 * information on the success URL.
 * *
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
  /** HTTP request from the client */
  request: Request,
  /** @see {@linkcode OAuth2ClientConfig} */
  oauthConfig: OAuth2ClientConfig,
  options?: SignInOptions,
): Promise<Response> {
  const state = crypto.randomUUID();
  const { uri, codeVerifier } = await new OAuth2Client(oauthConfig)
    .code.getAuthorizationUri({ state });

  if (options?.urlParams) {
    Object.entries(options.urlParams).forEach(([key, value]) =>
      uri.searchParams.append(key, value)
    );
  }

  const url = new URL(request.url);
  const oauthSessionId = crypto.randomUUID();
  const cookie: Cookie = {
    ...COOKIE_BASE,
    name: getCookieName(OAUTH_COOKIE_NAME, isSecure(url)),
    value: oauthSessionId,
    secure: isSecure(url),
    domain: getDomain(url),
    /**
     * A maximum authorization code lifetime of 10 minutes is recommended.
     * This cookie lifetime matches that value.
     *
     * @see {@link https://datatracker.ietf.org/doc/html/rfc6749#section-4.1.2}
     */
    maxAge: 10 * 60,
  };
  const successUrl = getSuccessUrl(request);
  await setOAuthSession(oauthSessionId, { state, codeVerifier, successUrl }, {
    expireIn: cookie.maxAge! * SECOND,
  });
  const response = redirect(uri.toString());
  setCookie(response.headers, cookie);
  return response;
}
