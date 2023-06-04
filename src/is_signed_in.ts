// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import { getSiteCookie } from "./_cookies.ts";

export function isSignedIn(request: Request) {
  return Boolean(getSiteCookie(request));
}
