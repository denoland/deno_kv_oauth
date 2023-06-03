import { deleteSiteCookie, getSiteCookie } from "./_cookies.ts";
import { redirect } from "./_http.ts";
import { deleteTokensBySiteSession } from "./_kv.ts";

export async function signOut(request: Request, redirectUrl = "/") {
  const siteSessionId = getSiteCookie(request);
  if (siteSessionId) await deleteTokensBySiteSession(siteSessionId);

  const response = redirect(redirectUrl);
  deleteSiteCookie(request.url, response.headers);
  return response;
}
