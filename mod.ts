// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import {
  assert,
  type Cookie,
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

const OAUTH_COOKIE_NAME = "oauth-session";
const OAUTH_SESSION_KV_PREFIX = "oauth_sessions";

const SITE_COOKIE_NAME = "site-session";
const TOKENS_BY_SITE_SESSION_KV_PREFIX = "tokens_by_site_session";

const kv = await Deno.openKv();

export type Provider = "github" | "discord";

function createGitHubClient(): OAuth2ClientConfig {
  return {
    clientId: Deno.env.get("GITHUB_CLIENT_ID")!,
    clientSecret: Deno.env.get("GITHUB_CLIENT_SECRET")!,
    authorizationEndpointUri: "https://github.com/login/oauth/authorize",
    tokenUri: "https://github.com/login/oauth/access_token",
  };
}

function createDiscordClient(): OAuth2ClientConfig {
  return {
    clientId: Deno.env.get("DISCORD_CLIENT_ID")!,
    clientSecret: Deno.env.get("DISCORD_CLIENT_SECRET")!,
    authorizationEndpointUri: "https://discord.com/oauth2/authorize",
    tokenUri: "https://discord.com/api/oauth2/token",
  };
}

export function createClientConfig(provider: Provider): OAuth2ClientConfig {
  switch (provider) {
    case "github":
      return createGitHubClient();
    case "discord":
      return createDiscordClient();
    default:
      throw new Error(`Provider ID "${provider}" not supported`);
  }
}

function getCookieName(name: string, secure: boolean) {
  return secure ? `__Host-${name}` : name;
}

/** Copied from https://web.dev/first-party-cookie-recipes/#the-good-first-party-cookie-recipe */
function createCookie(name: string, value: string, secure: boolean) {
  return {
    name: getCookieName(name, secure),
    value: value,
    path: "/",
    secure,
    httpOnly: true,
    maxAge: 7776000,
    sameSite: "Lax",
  } as Cookie;
}

export async function signIn(
  request: Request,
  providerOrClientConfig: Provider | OAuth2ClientConfig,
  scope?: string | string[],
): Promise<Response> {
  const clientConfig = typeof providerOrClientConfig === "string"
    ? createClientConfig(providerOrClientConfig)
    : providerOrClientConfig;

  const oauth2Client = new OAuth2Client(clientConfig);

  // Generate a random state
  const state = crypto.randomUUID();
  // Use that state to generate the authorization URI
  const { uri, codeVerifier } = await oauth2Client.code
    .getAuthorizationUri({ state, scope });

  // Store the OAuth session object (state and PKCE code verifier) in Deno KV
  const oauthSessionId = crypto.randomUUID();
  await kv.set([OAUTH_SESSION_KV_PREFIX, oauthSessionId], {
    state,
    codeVerifier,
  });

  // Store the ID of that OAuth session object in a client cookie
  const headers = new Headers({ location: uri.toString() });
  setCookie(
    headers,
    createCookie(
      OAUTH_COOKIE_NAME,
      oauthSessionId,
      request.url.startsWith("https"),
    ),
  );

  // Redirect to the authorization endpoint
  return new Response(null, { status: Status.Found, headers });
}

export async function handleCallback(
  request: Request,
  providerOrClientConfig: Provider | OAuth2ClientConfig,
  redirectUrl = "/",
): Promise<Response> {
  const oauthCookieName = getCookieName(
    OAUTH_COOKIE_NAME,
    request.url.startsWith("https"),
  );

  const clientConfig = typeof providerOrClientConfig === "string"
    ? createClientConfig(providerOrClientConfig)
    : providerOrClientConfig;

  // Get the OAuth session ID from the client's cookie and ensure it's defined
  const oauthSessionId = getCookies(request.headers)[oauthCookieName];
  assert(oauthSessionId, `Cookie ${oauthCookieName} not found`);

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
  const oauth2Client = new OAuth2Client(clientConfig);
  const siteSessionId = crypto.randomUUID();
  const tokens = await oauth2Client.code.getToken(
    request.url,
    oauthSession,
  );
  await kv.set([TOKENS_BY_SITE_SESSION_KV_PREFIX, siteSessionId], tokens);

  const headers = new Headers({ location: redirectUrl });
  setCookie(
    headers,
    createCookie(
      SITE_COOKIE_NAME,
      siteSessionId,
      request.url.startsWith("https"),
    ),
  );
  return new Response(null, { status: Status.Found, headers });
}

export function isSignedIn(request: Request) {
  const siteCookieName = getCookieName(
    SITE_COOKIE_NAME,
    request.url.startsWith("https"),
  );
  return Boolean(getCookies(request.headers)[siteCookieName]);
}

export async function signOut(
  request: Request,
  redirectUrl = "/",
): Promise<Response> {
  const siteCookieName = getCookieName(
    SITE_COOKIE_NAME,
    request.url.startsWith("https"),
  );

  const siteSessionId = getCookies(request.headers)[siteCookieName];
  assert(siteSessionId, `Cookie ${siteCookieName} not found`);

  await kv.delete([TOKENS_BY_SITE_SESSION_KV_PREFIX, siteSessionId]);

  const headers = new Headers({ location: redirectUrl });
  deleteCookie(headers, siteCookieName);
  return new Response(null, { status: Status.Found, headers });
}

export async function getSessionTokens(request: Request) {
  const siteCookieName = getCookieName(
    SITE_COOKIE_NAME,
    request.url.startsWith("https"),
  );

  const siteSessionId = getCookies(request.headers)[siteCookieName];
  assert(siteSessionId, `Cookie ${siteCookieName} not found`);

  const tokensRes = await kv.get<Tokens>([
    TOKENS_BY_SITE_SESSION_KV_PREFIX,
    siteSessionId,
  ]);
  const tokens = tokensRes.value;
  assert(tokens, `Tokens by site session ${siteSessionId} entry not found`);
  return tokens;
}
