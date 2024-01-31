// Copyright 2023-2024 the Deno authors. All rights reserved. MIT license.
const DENO_KV_PATH_KEY = "DENO_KV_PATH";
let path = undefined;
if (
  (await Deno.permissions.query({ name: "env", variable: DENO_KV_PATH_KEY }))
    .state === "granted"
) {
  path = Deno.env.get(DENO_KV_PATH_KEY);
}
const kv = await Deno.openKv(path);

// Gracefully shutdown after tests
addEventListener("beforeunload", async () => {
  await kv.close();
});

export interface OAuthSession {
  state: string;
  codeVerifier: string;
  successUrl: string;
}

function oauthSessionKey(id: string): [string, string] {
  return ["oauth_sessions", id];
}

export async function getAndDeleteOAuthSession(
  id: string,
): Promise<OAuthSession> {
  const key = oauthSessionKey(id);
  const oauthSessionRes = await kv.get<OAuthSession>(key);
  const oauthSession = oauthSessionRes.value;
  if (oauthSession === null) {
    throw new Deno.errors.NotFound("OAuth session not found");
  }

  const res = await kv.atomic()
    .check(oauthSessionRes)
    .delete(key)
    .commit();

  if (!res.ok) throw new Error("Failed to delete OAuth session");
  return oauthSession;
}

export async function setOAuthSession(
  id: string,
  value: OAuthSession,
  /**
   * OAuth session entry expiration isn't included in unit tests as it'd
   * require a persistent and restartable KV instance. This is difficult to do
   * in this module, as the KV instance is initialized top-level.
   */
  options: { expireIn: number },
) {
  await kv.set(oauthSessionKey(id), value, options);
}

function siteSessionKey(id: string): [string, string] {
  return ["site_sessions", id];
}

export async function getSiteSession<T>(id: string): Promise<T | null> {
  const res = await kv.get<T>(siteSessionKey(id));
  return res.value;
}

export async function setSiteSession(
  id: string,
  value?: unknown,
  expireIn?: number,
) {
  await kv.set(siteSessionKey(id), value, { expireIn });
}

export async function deleteSiteSession(id: string) {
  await kv.delete(siteSessionKey(id));
}
