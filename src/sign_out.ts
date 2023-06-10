// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import { deleteCookie } from "../deps.ts";
import {
  deleteStoredTokensBySiteSession,
  getCookieName,
  isSecure,
  redirect,
  SITE_COOKIE_NAME,
} from "./_core.ts";
import { getSessionId } from "./get_session_id.ts";

export async function signOut(request: Request, redirectUrl = "/") {
  const sessionId = await getSessionId(request);
  if (sessionId === null) return redirect(redirectUrl);

  await deleteStoredTokensBySiteSession(sessionId);

  const response = redirect(redirectUrl);
  const cookieName = getCookieName(SITE_COOKIE_NAME, isSecure(request.url));
  deleteCookie(response.headers, cookieName, { path: "/" });
  return response;
}
