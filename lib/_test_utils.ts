// Copyright 2023-2024 the Deno authors. All rights reserved. MIT license.
import { assert, assertEquals } from "@std/assert";
import { type OAuth2ClientConfig } from "https://deno.land/x/oauth2_client@v1.0.2/mod.ts";
import { STATUS_CODE } from "@std/http/status";

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
    successUrl: `http://${crypto.randomUUID()}.com`,
  };
}

export function randomTokensBody() {
  return {
    access_token: crypto.randomUUID(),
    token_type: crypto.randomUUID(),
  };
}

export function assertRedirect(response: Response, location?: string) {
  assertEquals(response.status, STATUS_CODE.Found);
  if (location !== undefined) {
    assertEquals(response.headers.get("location"), location);
  } else {
    assert(response.headers.has("location"));
  }
}
