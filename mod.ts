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

const kv = await Deno.openKv();

export type Provider = "github";

function createGitHubClient(): OAuth2ClientConfig {
  return {
    clientId: Deno.env.get("GITHUB_CLIENT_ID")!,
    clientSecret: Deno.env.get("GITHUB_CLIENT_SECRET")!,
    authorizationEndpointUri: "https://github.com/login/oauth/authorize",
    tokenUri: "https://github.com/login/oauth/access_token",
  };
}

export function createClientConfig(provider: Provider): OAuth2ClientConfig {
  switch (provider) {
    case "github":
      return createGitHubClient();
    default:
      throw new Error(`Provider ID "${provider}" not supported`);
  }
}

export async function signIn(
  providerOrClientConfig: Provider | OAuth2ClientConfig,
): Promise<Response> {
  const clientConfig = typeof providerOrClientConfig === "string"
    ? createClientConfig(providerOrClientConfig)
    : providerOrClientConfig;

  const oauth2Client = new OAuth2Client(clientConfig);

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
  });

  // Redirect to the authorization endpoint
  return new Response(null, { status: Status.Found, headers });
}

export async function handleCallback(
  request: Request,
  providerOrClientConfig: Provider | OAuth2ClientConfig,
  redirectUrl = "/",
): Promise<Response> {
  const clientConfig = typeof providerOrClientConfig === "string"
    ? createClientConfig(providerOrClientConfig)
    : providerOrClientConfig;

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
  const oauth2Client = new OAuth2Client(clientConfig);
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
  deleteCookie(headers, SITE_SESSION_COOKIE_NAME);
  return new Response(null, { status: Status.Found, headers });
}

export async function getSessionTokens(request: Request) {
  const siteSessionId = getCookies(request.headers)[SITE_SESSION_COOKIE_NAME];
  assert(siteSessionId, `Cookie ${SITE_SESSION_COOKIE_NAME} not found`);

  const tokensRes = await kv.get<Tokens>([
    TOKENS_BY_SITE_SESSION_KV_PREFIX,
    siteSessionId,
  ]);
  const tokens = tokensRes.value;
  assert(tokens, `Tokens by site session ${siteSessionId} entry not found`);
  return tokens;
}
