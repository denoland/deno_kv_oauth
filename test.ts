import {
  createProvider,
  isSignedIn,
  type Provider,
  signIn,
  signOut,
} from "./mod.ts";
import {
  assert,
  assertEquals,
  getSetCookies,
  isRedirectStatus,
  loadSync,
} from "./deps.ts";

loadSync({ export: true });

Deno.test("createProvider()", () => {
  const clientId = Deno.env.get("GITHUB_CLIENT_ID")!;
  const clientSecret = Deno.env.get("GITHUB_CLIENT_SECRET")!;

  assertEquals<Provider>(createProvider("github"), {
    oauth2ClientConfig: {
      clientId,
      clientSecret,
      authorizationEndpointUri: "https://github.com/login/oauth/authorize",
      tokenUri: "https://github.com/login/oauth/access_token",
    },
    getUserUrl: "https://api.github.com/user",
  });
});

Deno.test("signIn()", async () => {
  const provider = createProvider("github");
  const response = await signIn(provider);

  assert(isRedirectStatus(response.status));
  assertEquals(typeof response.headers.get("location"), "string");
  assert(
    getSetCookies(response.headers).some((setCookie) =>
      setCookie.name === "oauth-session" && setCookie.path === "/" &&
      typeof setCookie.value === "string"
    ),
  );
});

Deno.test("signOut()", async () => {
  const request = new Request("http://example.com", {
    headers: { cookie: "site-session=cookie-value" },
  });
  const response = await signOut(request);

  assert(isRedirectStatus(response.status));
  assertEquals(typeof response.headers.get("location"), "string");
  assertEquals(
    getSetCookies(response.headers).find((setCookie) =>
      setCookie.name === "site-session"
    ),
    {
      name: "site-session",
      value: "",
      path: "/",
      expires: new Date(0),
    },
  );
});

Deno.test("isSignedIn()", () => {
  // No headers
  const request = new Request("http://example.com");
  assertEquals(isSignedIn(request), false);

  // With valid site session cookie
  request.headers.set("cookie", "site-session=cookie-value");
  assertEquals(isSignedIn(request), true);
});
