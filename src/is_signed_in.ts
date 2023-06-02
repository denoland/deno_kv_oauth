import { getSiteCookie } from "./_cookies.ts";

export function isSignedIn(request: Request) {
  return Boolean(getSiteCookie(request));
}
