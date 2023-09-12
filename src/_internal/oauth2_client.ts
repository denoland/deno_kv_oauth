// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import {
  OAuth2Client,
  OAuth2ResponseError,
} from "https://deno.land/x/oauth2_client@v1.0.2/mod.ts";
import type { OAuthConfig, OAuthSession, Tokens } from "../types.ts";

export function getAuthorizationUri(
  config: OAuthConfig,
  state: string,
): Promise<{ uri: URL; codeVerifier: string }> {
  return createOAuth2Client(config).code.getAuthorizationUri({ state });
}

export function getToken(
  config: OAuthConfig,
  url: string | URL,
  oauthSession: OAuthSession,
): Promise<Tokens> {
  return createOAuth2Client(config).code.getToken(url, oauthSession);
}

export async function refresh(
  config: OAuthConfig,
  refreshToken: string,
): Promise<Tokens | undefined> {
  try {
    return await createOAuth2Client(config).refreshToken.refresh(refreshToken);
  } catch (error) {
    if (
      error instanceof OAuth2ResponseError && error.error === "invalid_grant"
    ) {
      // The refresh token is likely expired
      return undefined;
    }
    throw error;
  }
}

function createOAuth2Client(config: OAuthConfig): OAuth2Client {
  const {
    clientId,
    clientSecret,
    redirectUri,
    authorizationEndpointUri,
    tokenUri,
    scope,
  } = config;

  return new OAuth2Client({
    clientId,
    clientSecret,
    redirectUri: redirectUri?.toString(),
    authorizationEndpointUri: authorizationEndpointUri?.toString(),
    tokenUri: tokenUri?.toString(),
    defaults: {
      scope,
    },
  });
}
