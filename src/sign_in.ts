import type { OAuth2Client } from "../deps.ts";
import { setOAuthCookie } from "./_cookies.ts";
import { redirect } from "./_http.ts";
import { setOAuthSession } from "./_kv.ts";

export async function signIn(
  request: Request,
  oauth2Client: OAuth2Client,
  scope?: string | string[],
): Promise<Response> {
  // Generate a random state
  const state = crypto.randomUUID();
  // Use that state to generate the authorization URI
  const { uri, codeVerifier } = await oauth2Client.code
    .getAuthorizationUri({ state, scope });

  // Store the OAuth session object (state and PKCE code verifier) in Deno KV
  const oauthSessionId = crypto.randomUUID();
  await setOAuthSession(oauthSessionId, { state, codeVerifier });

  // Store the ID of that OAuth session object in a client cookie
  const response = redirect(uri.toString());
  setOAuthCookie(request.url, response.headers, oauthSessionId);
  return response;
}
