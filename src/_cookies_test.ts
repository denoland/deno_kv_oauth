import { assertEquals } from "../deps.ts";
import {
  getOAuthCookie,
  getSiteCookie,
  OAUTH_COOKIE_NAME,
  SITE_COOKIE_NAME,
} from "./_cookies.ts";

Deno.test("getOAuthCookie() - insecure", () => {
  const request = new Request("http://example.com");

  // OAuth session doesn't yet exist
  assertEquals(getOAuthCookie(request), undefined);

  const value = crypto.randomUUID();
  request.headers.append("cookie", `${OAUTH_COOKIE_NAME}=${value}`);

  assertEquals(getOAuthCookie(request), value);

  request.headers.delete("cookie");
  assertEquals(getOAuthCookie(request), undefined);
});

Deno.test("getOAuthCookie() - secure", () => {
  const request = new Request("https://example.com");

  // OAuth session doesn't yet exist
  assertEquals(getOAuthCookie(request), undefined);

  const value = crypto.randomUUID();
  request.headers.append("cookie", `__Host-${OAUTH_COOKIE_NAME}=${value}`);

  assertEquals(getOAuthCookie(request), value);

  request.headers.delete("cookie");
  assertEquals(getOAuthCookie(request), undefined);
});

Deno.test("getSiteCookie() - insecure", () => {
  const request = new Request("http://example.com");

  // OAuth session doesn't yet exist
  assertEquals(getSiteCookie(request), undefined);

  const value = crypto.randomUUID();
  request.headers.append("cookie", `${SITE_COOKIE_NAME}=${value}`);

  assertEquals(getSiteCookie(request), value);

  request.headers.delete("cookie");
  assertEquals(getSiteCookie(request), undefined);
});

Deno.test("getSiteCookie() - secure", () => {
  const request = new Request("https://example.com");

  // OAuth session doesn't yet exist
  assertEquals(getSiteCookie(request), undefined);

  const value = crypto.randomUUID();
  request.headers.append("cookie", `__Host-${SITE_COOKIE_NAME}=${value}`);

  assertEquals(getSiteCookie(request), value);

  request.headers.delete("cookie");
  assertEquals(getSiteCookie(request), undefined);
});
