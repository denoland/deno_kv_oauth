// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import type { OAuth2ClientConfig, Tokens } from "../dev_deps.ts";
import type { OAuthSession } from "./core.ts";

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

export function randomTokens(): Tokens {
  return {
    accessToken: crypto.randomUUID(),
    tokenType: crypto.randomUUID(),
  };
}
