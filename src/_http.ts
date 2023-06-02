// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import { RedirectStatus, Status } from "../deps.ts";

/**
 * @param location A relative (to the request URL) or absolute URL.
 * @param status HTTP status
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Location}
 */
export function redirect(
  location: string,
  status: Status.Created | RedirectStatus = Status.Found,
) {
  return new Response(null, {
    headers: {
      location,
    },
    status,
  });
}
