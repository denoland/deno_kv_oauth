// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import { getCookies } from "../deps.ts";
import {
  getCookieName,
  getTokensBySiteSession,
  isSecure,
  SITE_COOKIE_NAME,
} from "./_core.ts";

export async function getSessionId(request: Request) {
  const cookieName = getCookieName(SITE_COOKIE_NAME, isSecure(request.url));
  const sessionId = getCookies(request.headers)[cookieName];
  if (sessionId === undefined) return null;

  /**
   * @todo Perhaps an eventual consistency check should happen first.
   * Revisit this once more documentation about eventual consistency is published.
   */
  return await getTokensBySiteSession(sessionId) !== null ? sessionId : null;
}
