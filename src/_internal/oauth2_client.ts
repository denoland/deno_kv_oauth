import { OAuth2Client } from "../../deps.ts";
import type { OAuthConfig, OAuthSession } from "../types.ts";

export function getAuthorizationUri(
  config: OAuthConfig | OAuth2Client,
  state: string,
): Promise<{ uri: URL; codeVerifier: string }> {
  return getAuthorizationCodeGrant(config).getAuthorizationUri({ state });
}

export function getToken(
  config: OAuthConfig | OAuth2Client,
  url: string | URL,
  oauthSession: OAuthSession,
) {
  return getAuthorizationCodeGrant(config).getToken(url, oauthSession);
}

function createOAuth2Client(config: OAuthConfig): OAuth2Client {
  const {
    clientId,
    clientSecret,
    redirectUri,
    authorizationEndpointUri,
    tokenUri,
    headers,
    body,
    urlParams,
    scope,
    stateValidator,
  } = config;

  return new OAuth2Client({
    clientId,
    clientSecret,
    redirectUri,
    authorizationEndpointUri,
    tokenUri,
    defaults: {
      requestOptions: {
        headers,
        body,
        urlParams,
      },
      scope,
      stateValidator,
    },
  });
}

function isOAuth2Client(
  config: OAuthConfig | OAuth2Client,
): config is OAuth2Client {
  return config instanceof OAuth2Client;
}

function getAuthorizationCodeGrant(config: OAuthConfig | OAuth2Client) {
  if (isOAuth2Client(config)) {
    return config.code;
  } else {
    return createOAuth2Client(config).code;
  }
}
