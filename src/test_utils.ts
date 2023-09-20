// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import type { OAuth2ClientConfig, Tokens } from "../dev_deps.ts";
import { OAuthSession } from "./core.ts";

// Dummy OAuth configuration for testing only.
export const oauthConfig: OAuth2ClientConfig = {
  clientId: crypto.randomUUID(),
  clientSecret: crypto.randomUUID(),
  authorizationEndpointUri: "https://example.com/authorize",
  tokenUri: "https://example.com/token",
};

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
