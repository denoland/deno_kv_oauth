import { assertEquals } from "../deps.ts";
import { isSignedIn } from "./is_signed_in.ts";

Deno.test("isSignedIn() - insecure", () => {
  const request = new Request("http://example.com");
  assertEquals(isSignedIn(request), false);

  request.headers.append("cookie", "site-session=xxx");
  assertEquals(isSignedIn(request), true);
});

Deno.test("isSignedIn() - secure", () => {
  const request = new Request("https://example.com");
  assertEquals(isSignedIn(request), false);

  request.headers.append("cookie", "__Host-site-session=xxx");
  assertEquals(isSignedIn(request), true);
});
