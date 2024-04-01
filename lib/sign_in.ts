// Copyright 2023-2024 the Deno authors. All rights reserved. MIT license.
import {
  OAuth2Client,
  type OAuth2ClientConfig,
} from "https://deno.land/x/oauth2_client@v1.0.2/mod.ts";
import { SECOND } from "@std/datetime";
import { type Cookie, setCookie } from "@std/http";
import {
  COOKIE_BASE,
  getCookieName,
  getSuccessUrl,
  isHttps,
  OAUTH_COOKIE_NAME,
  redirect,
} from "./_http.ts";
import { setOAuthSession } from "./_kv.ts";

/** Options for {@linkcode signIn}. */
export interface SignInOptions {
  /** URL parameters that are appended to the authorization URI, if defined. */
  urlParams?: Record<string, string>;
}

/**
 * Handles the sign-in request and process for the given OAuth configuration
 * and redirects the client to the authorization URL.
 *
 * @see {@link https://github.com/denoland/deno_kv_oauth/tree/main#redirects-after-sign-in-and-sign-out}
 *
 * @example
 * ```ts
 * import { signIn, createGitHubOAuthConfig } from "jsr:@deno/kv-oauth";
 *
 * const oauthConfig = createGitHubOAuthConfig();
 *
 * export async function handleSignIn(request: Request) {
 *  return await signIn(request, oauthConfig);
 * }
 * ```
 *
 * @deprecated Use {@linkcode createHelpers} instead. This will be removed in v0.12.0.
 */
export async function signIn(
  request: Request,
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

  const oauthSessionId = crypto.randomUUID();
  const cookie: Cookie = {
    ...COOKIE_BASE,
    name: getCookieName(OAUTH_COOKIE_NAME, isHttps(request.url)),
    value: oauthSessionId,
    secure: isHttps(request.url),
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
