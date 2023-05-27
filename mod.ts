// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import {
  deleteCookie,
  getCookies,
  setCookie,
} from "https://deno.land/std@0.188.0/http/cookie.ts";
import {
  OAuth2Client,
  type OAuth2ClientConfig,
  Tokens,
} from "https://deno.land/x/oauth2_client@v1.0.0/mod.ts";
import { Status } from "https://deno.land/std@0.188.0/http/http_status.ts";
import { assert } from "https://deno.land/std@0.188.0/_util/asserts.ts";

interface OAuthSession {
  state: string;
  codeVerifier: string;
}

const OAUTH_SESSION_COOKIE_NAME = "oauth-session";
const OAUTH_SESSION_KV_PREFIX = "oauth_sessions";

const SITE_SESSION_COOKIE_NAME = "site-session";
const TOKENS_BY_SITE_SESSION_KV_PREFIX = "tokens_by_site_session";

const kv = await Deno.openKv();

export interface Provider {
  oauth2ClientConfig: OAuth2ClientConfig;
  getUserUrl: string;
}

export function createGitHubProvider(
  additionalOAuth2ClientConfig?: Partial<OAuth2ClientConfig>,
): Provider {
  return {
    oauth2ClientConfig: {
      clientId: Deno.env.get("GITHUB_CLIENT_ID")!,
      clientSecret: Deno.env.get("GITHUB_CLIENT_SECRET")!,
      authorizationEndpointUri: "https://github.com/login/oauth/authorize",
      tokenUri: "https://github.com/login/oauth/access_token",
      ...additionalOAuth2ClientConfig,
    },
    getUserUrl: "https://api.github.com/user",
  };
}

export async function signIn(provider: Provider): Promise<Response> {
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
  });

  // Redirect to the authorization endpoint
  return new Response(null, { status: Status.Found, headers });
}

export async function handleCallback(
  request: Request,
  provider: Provider,
  redirectUrl = "/",
): Promise<Response> {
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

  const tokensRes = await kv.get<Tokens>([
    TOKENS_BY_SITE_SESSION_KV_PREFIX,
    siteSessionId,
  ]);
  const tokens = tokensRes.value;
  assert(tokens, `Tokens by site session ${siteSessionId} entry not found`);

  const headers = new Headers({ location: redirectUrl });
  deleteCookie(headers, SITE_SESSION_COOKIE_NAME);
  return new Response(null, { status: Status.Found, headers });
}

export async function getUser(request: Request, provider: Provider) {
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
