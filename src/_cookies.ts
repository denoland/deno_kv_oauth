import { type Cookie, deleteCookie, getCookies, setCookie } from "../deps.ts";

function isSecure(url: string) {
  return url.startsWith("https");
}

function getCookieName(name: string, isSecure: boolean) {
  return isSecure ? "__Host-" + name : name;
}

function getCookie(request: Request, unparsedName: string) {
  const name = getCookieName(unparsedName, isSecure(request.url));
  return getCookies(request.headers)[name];
}

// https://web.dev/first-party-cookie-recipes/#the-good-first-party-cookie-recipe
function createCookie(name: string, value: string, secure: boolean) {
  return {
    name: getCookieName(name, secure),
    value,
    path: "/",
    secure,
    httpOnly: true,
    maxAge: 7776000,
    sameSite: "Lax",
  } as Cookie;
}

// OAuth session
export const OAUTH_COOKIE_NAME = "oauth-session";

export function getOAuthCookie(request: Request) {
  return getCookie(request, OAUTH_COOKIE_NAME);
}

export function setOAuthCookie(
  requestUrl: string,
  responseHeaders: Headers,
  value: string,
) {
  const cookie = createCookie(OAUTH_COOKIE_NAME, value, isSecure(requestUrl));
  setCookie(responseHeaders, cookie);
}

export function deleteOAuthCookie(
  requestUrl: string,
  responseHeaders: Headers,
) {
  const name = getCookieName(OAUTH_COOKIE_NAME, isSecure(requestUrl));
  deleteCookie(responseHeaders, name);
}

// Site session
export const SITE_COOKIE_NAME = "site-session";

export function getSiteCookie(request: Request) {
  return getCookie(request, SITE_COOKIE_NAME);
}

export function setSiteCookie(
  responseHeaders: Headers,
  requestUrl: string,
  value: string,
) {
  const cookie = createCookie(SITE_COOKIE_NAME, value, isSecure(requestUrl));
  setCookie(responseHeaders, cookie);
}

export function deleteSiteCookie(requestUrl: string, responseHeaders: Headers) {
  const name = getCookieName(SITE_COOKIE_NAME, isSecure(requestUrl));
  deleteCookie(responseHeaders, name);
}
