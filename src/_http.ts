// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import { Status } from "../deps.ts";

/**
 * @param location A relative (to the request URL) or absolute URL.
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Location}
 */
export function redirect(location: string) {
  return new Response(null, {
    headers: {
      location,
    },
    status: Status.Found,
  });
}
