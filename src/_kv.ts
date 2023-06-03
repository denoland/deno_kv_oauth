import type { Tokens } from "../deps.ts";

const kv = await Deno.openKv();

// OAuth session
export interface OAuthSession {
  state: string;
  codeVerifier: string;
}

const OAUTH_SESSION_PREFIX = "oauth_sessions";

export async function getOAuthSession(id: string) {
  const result = await kv.get<OAuthSession>([OAUTH_SESSION_PREFIX, id]);
  return result.value;
}

export async function setOAuthSession(id: string, oauthSession: OAuthSession) {
  await kv.set([OAUTH_SESSION_PREFIX, id], oauthSession);
}

export async function deleteOAuthSession(id: string) {
  await kv.delete([OAUTH_SESSION_PREFIX, id]);
}

// Tokens by session
const TOKENS_BY_SESSION_PREFIX = "tokens_by_session";

export async function getTokensBySiteSession(id: string) {
  const result = await kv.get<Tokens>([TOKENS_BY_SESSION_PREFIX, id]);
  return result.value;
}

export async function setTokensBySiteSession(id: string, tokens: Tokens) {
  await kv.set([TOKENS_BY_SESSION_PREFIX, id], tokens);
}

export async function deleteTokensBySiteSession(id: string) {
  await kv.delete([TOKENS_BY_SESSION_PREFIX, id]);
}
