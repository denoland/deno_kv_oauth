// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import { type Cookie, getCookies, Status } from "../deps.ts";

export const OAUTH_COOKIE_NAME = "oauth-session";
export const SITE_COOKIE_NAME = "site-session";

export function isHttps(url: string): boolean {
  return url.startsWith("https://");
}

/**
 * Dynamically prefixes the cookie name, depending on whether it's for a secure
 * origin (HTTPS).
 */
export function getCookieName(name: string, isHttps: boolean): string {
  return isHttps ? "__Host-" + name : name;
}

/**
 * @see {@link https://web.dev/first-party-cookie-recipes/#the-good-first-party-cookie-recipe}
 */
export const COOKIE_BASE = {
  secure: true,
  path: "/",
  httpOnly: true,
  // 90 days
  maxAge: 7776000,
  sameSite: "Lax",
} as Required<Pick<Cookie, "path" | "httpOnly" | "maxAge" | "sameSite">>;

export function redirect(location: string): Response {
  return new Response(null, {
    headers: {
      location,
    },
    status: Status.Found,
  });
}

/**
 * @see {@link https://deno.land/x/deno_kv_oauth@v0.9.0#redirects-after-sign-in-and-sign-out}
 */
export function getSuccessUrl(request: Request): string {
  const url = new URL(request.url);

  const successUrl = url.searchParams.get("success_url");
  if (successUrl !== null) return successUrl;

  const referrer = request.headers.get("referer");
  if (referrer !== null && (new URL(referrer).origin === url.origin)) {
    return referrer;
  }

  return "/";
}

export function getSessionIdCookie(
  request: Request,
  cookieName = getCookieName(SITE_COOKIE_NAME, isHttps(request.url)),
): string | undefined {
  return getCookies(request.headers)[cookieName];
}
