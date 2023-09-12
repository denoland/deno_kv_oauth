// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import type { OAuthSession, Tokens } from "./types.ts";
import { createCustomOAuthConfig } from "./providers/custom.ts";

// Dummy config for testing only.
export const oauthConfig = createCustomOAuthConfig({
  name: "Test",
  clientId: crypto.randomUUID(),
  clientSecret: crypto.randomUUID(),
  authorizationEndpointUri: "https://example.com/authorize",
  tokenUri: "https://example.com/token",
  scope: [],
  redirectUri: "/callback",
});

export function genOAuthSession(): OAuthSession {
  return {
    state: crypto.randomUUID(),
    codeVerifier: crypto.randomUUID(),
  };
}

export function genTokens(): Tokens {
  return {
    accessToken: crypto.randomUUID(),
    tokenType: crypto.randomUUID(),
  };
}
