// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import { assert, assertEquals } from "../dev_deps.ts";
import { type OAuth2ClientConfig, Status } from "../deps.ts";
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

export function assertRedirect(response: Response) {
  assertEquals(response.status, Status.Found);
  assert(response.headers.has("location"));
}
