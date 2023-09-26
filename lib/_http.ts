// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import { type Cookie, Status } from "../deps.ts";

export const OAUTH_COOKIE_NAME = "oauth-session";
export const SITE_COOKIE_NAME = "site-session";

/**
 * Determines whether the request URL is of a secure origin using the HTTPS
 * protocol.
 */
export function isSecure(url: URL) {
  return url.protocol === "https:";
}

/**
 * Dynamically prefixes the cookie name, depending on whether it's for a secure
 * origin (HTTPS).
 */
export function getCookieName(name: string, isSecure: boolean) {
  return isSecure ? "__Secure-" + name : name;
}

export function getDomain(url: URL) {
  return url.hostname
    .split(".")
    .slice(-2)
    .join(".");
}

/** @see {@link https://web.dev/first-party-cookie-recipes/#first-party-cookie-recipe-for-sites-with-subdomains} */
export const COOKIE_BASE = {
  path: "/",
  httpOnly: true,
  // 90 days
  maxAge: 7776000,
  sameSite: "Lax",
} as Required<Pick<Cookie, "path" | "httpOnly" | "maxAge" | "sameSite">>;

/**
 * Returns a response that redirects the client to the specified location.
 * The location can be a relative path or absolute URL.
 * This function differs from
 * [Response.redirect()]{@linkcode https://developer.mozilla.org/en-US/docs/Web/API/Response/redirect_static}
 * in that it allows for relative URLs to be specified.
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Location}
 */
export function redirect(location: string) {
  return new Response(null, {
    headers: {
      location,
    },
    status: Status.Found,
  });
}

/**
 * See "Redirect URL after Sign-In or Sign-Out" section in the README for more
 * information on the success URL.
 */
export function getSuccessUrl(request: Request) {
  const url = new URL(request.url);

  const successUrl = url.searchParams.get("success_url");
  if (successUrl !== null) return successUrl;

  const referrer = request.headers.get("referer");
  if (referrer !== null && (new URL(referrer).origin === url.origin)) {
    return referrer;
  }

  return "/";
}
