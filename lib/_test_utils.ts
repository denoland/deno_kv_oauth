// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import {
  assert,
  assertEquals,
  type OAuth2ClientConfig,
  Status,
} from "../dev_deps.ts";
import type { OAuthSession } from "./_kv.ts";

export function randomOAuthConfig(): OAuth2ClientConfig {
  return {
    clientId: crypto.randomUUID(),
    clientSecret: crypto.randomUUID(),
    authorizationEndpointUri: "https://example.com/authorize",
    tokenUri: "https://example.com/token",
  };
}

export function randomOAuthSession(): OAuthSession {
  return {
    state: crypto.randomUUID(),
    codeVerifier: crypto.randomUUID(),
  };
}

export function randomTokensBody() {
  return {
    access_token: crypto.randomUUID(),
    token_type: crypto.randomUUID(),
  };
}

export function assertRedirect(response: Response, location?: string) {
  assertEquals(response.status, Status.Found);
  if (location !== undefined) {
    assertEquals(response.headers.get("location"), location);
  } else {
    assert(response.headers.has("location"));
  }
}
