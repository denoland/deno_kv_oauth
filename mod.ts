// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import {
  assert,
  deleteCookie,
  getCookies,
  OAuth2Client,
  type OAuth2ClientConfig,
  setCookie,
  Status,
  type Tokens,
} from "./deps.ts";

interface OAuthSession {
  state: string;
  codeVerifier: string;
}

const OAUTH_SESSION_COOKIE_NAME = "oauth-session";
const OAUTH_SESSION_KV_PREFIX = "oauth_sessions";

const SITE_SESSION_COOKIE_NAME = "site-session";
const TOKENS_BY_SITE_SESSION_KV_PREFIX = "tokens_by_site_session";

const COOKIE_BASE = {
  path: "/",
  secure: true,
  httpOnly: true,
  maxAge: 7776000,
  sameSite: "Lax",
} as const;

const kv = await Deno.openKv();

export interface Provider {
  oauth2ClientConfig: OAuth2ClientConfig;
  getUserUrl: string;
}

function createGitHubProvider(): Provider {
  return {
    oauth2ClientConfig: {
      clientId: Deno.env.get("GITHUB_CLIENT_ID")!,
      clientSecret: Deno.env.get("GITHUB_CLIENT_SECRET")!,
      authorizationEndpointUri: "https://github.com/login/oauth/authorize",
      tokenUri: "https://github.com/login/oauth/access_token",
    },
    getUserUrl: "https://api.github.com/user",
  };
}

export type ProviderId = "github";

export function createProvider(providerId: ProviderId) {
  switch (providerId) {
    case "github":
      return createGitHubProvider();
    default:
      throw new Error(`Provider ID "${providerId}" not supported`);
  }
}

export async function signIn(
  providerIdOrProvider: ProviderId | Provider,
): Promise<Response> {
  const provider = typeof providerIdOrProvider === "string"
    ? createProvider(providerIdOrProvider)
    : providerIdOrProvider;

  const oauth2Client = new OAuth2Client(provider.oauth2ClientConfig);

  // Generate a random state
  const state = crypto.randomUUID();
  // Use that state to generate the authorization URI
  const { uri, codeVerifier } = await oauth2Client.code
    .getAuthorizationUri({ state });

  // Store the OAuth session object (state and PKCE code verifier) in Deno KV
  const oauthSessionId = crypto.randomUUID();
  await kv.set([OAUTH_SESSION_KV_PREFIX, oauthSessionId], {
    state,
    codeVerifier,
  });

  // Store the ID of that OAuth session object in a client cookie
  const headers = new Headers({ location: uri.toString() });
  setCookie(headers, {
    name: OAUTH_SESSION_COOKIE_NAME,
    value: oauthSessionId,
    ...COOKIE_BASE,
  });

  // Redirect to the authorization endpoint
  return new Response(null, { status: Status.Found, headers });
}

export async function handleCallback(
  request: Request,
  providerIdOrProvider: ProviderId | Provider,
  redirectUrl = "/",
): Promise<Response> {
  const provider = typeof providerIdOrProvider === "string"
    ? createProvider(providerIdOrProvider)
    : providerIdOrProvider;

  // Get the OAuth session ID from the client's cookie and ensure it's defined
  const oauthSessionId = getCookies(request.headers)[OAUTH_SESSION_COOKIE_NAME];
  assert(oauthSessionId, `Cookie ${OAUTH_SESSION_COOKIE_NAME} not found`);

  // Get the OAuth session object stored in Deno KV and ensure it's defined
  const oauthSessionRes = await kv.get<OAuthSession>([
    OAUTH_SESSION_KV_PREFIX,
    oauthSessionId,
  ]);
  const oauthSession = oauthSessionRes.value;
  assert(oauthSession, `OAuth session ${oauthSessionId} entry not found`);

  // Clear the stored OAuth session now that's no longer needed
  await kv.delete([OAUTH_SESSION_KV_PREFIX, oauthSessionId]);

  // Generate a random site session ID for the new user cookie
  const oauth2Client = new OAuth2Client(provider.oauth2ClientConfig);
  const siteSessionId = crypto.randomUUID();
  const tokens = await oauth2Client.code.getToken(
    request.url,
    oauthSession,
  );
  await kv.set([TOKENS_BY_SITE_SESSION_KV_PREFIX, siteSessionId], tokens);

  const headers = new Headers({ location: redirectUrl });
  setCookie(headers, {
    name: SITE_SESSION_COOKIE_NAME,
    value: siteSessionId,
    ...COOKIE_BASE,
  });
  return new Response(null, { status: Status.Found, headers });
}

export function isSignedIn(request: Request) {
  return Boolean(getCookies(request.headers)[SITE_SESSION_COOKIE_NAME]);
}

export async function signOut(
  request: Request,
  redirectUrl = "/",
): Promise<Response> {
  const siteSessionId = getCookies(request.headers)[SITE_SESSION_COOKIE_NAME];
  assert(siteSessionId, `Cookie ${SITE_SESSION_COOKIE_NAME} not found`);

  await kv.delete([TOKENS_BY_SITE_SESSION_KV_PREFIX, siteSessionId]);

  const headers = new Headers({ location: redirectUrl });
  deleteCookie(headers, SITE_SESSION_COOKIE_NAME, { path: "/" });
  return new Response(null, { status: Status.Found, headers });
}

export async function getUser(
  request: Request,
  providerIdOrProvider: ProviderId | Provider,
) {
  const provider = typeof providerIdOrProvider === "string"
    ? createProvider(providerIdOrProvider)
    : providerIdOrProvider;

  const siteSessionId = getCookies(request.headers)[SITE_SESSION_COOKIE_NAME];
  assert(siteSessionId, `Cookie ${SITE_SESSION_COOKIE_NAME} not found`);

  const tokensRes = await kv.get<Tokens>([
    TOKENS_BY_SITE_SESSION_KV_PREFIX,
    siteSessionId,
  ]);
  const tokens = tokensRes.value;
  assert(tokens, `Tokens by site session ${siteSessionId} entry not found`);

  const resp = await fetch(provider.getUserUrl, {
    headers: { authorization: `Bearer ${tokens.accessToken}` },
  });

  if (!resp.ok) throw new Error(await resp.text());
  return await resp.json();
}
