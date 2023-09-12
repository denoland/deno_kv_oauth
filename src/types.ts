// Copyright 2023 the Deno authors. All rights reserved. MIT license.

/**
 * Common configuration that will be obtained from
 * environment variables if not explicitly provided.
 */
export interface OAuthEnvConfig {
  /** The client ID provided by the authorization server. */
  clientId: string;

  /** The client secret provided by the authorization server, if using a confidential client. */
  clientSecret: string;

  /** The custom domain of the authorization server, if supported by the provider. */
  domain?: string;
}

/**
 * Information supplied by a provider but not directly necessary for
 * the OAuth2 process.
 */
export interface OAuthProviderInfo {
  /** The name of the provider (single PascalCase name that matches the function name and uppercase env var prefix) */
  name: string;
}

/**
 * Configuration supplied by the providers.
 */
export interface OAuthPredefinedConfig {
  /** The URI of the authorization server's authorization endpoint. */
  authorizationEndpointUri: string | URL;

  /** The URI of the authorization server's token endpoint. */
  tokenUri: string | URL;

  /**
   * Default scopes to request, this should be the minimal read scopes for sign-in and
   * user identity (eg. id, email), it should also include scopes for OpenID Connect if the provider supports it.
   */
  scope: string[];
}

/**
 * Variable configuration supplied by the library user.
 */
export interface OAuthVariableConfig {
  /**
   * The URI of the client's redirection endpoint (sometimes also called callback URI).
   * This may be an absolute URL, or a relative URL which will be resolved against the URL of the Request.
   */
  redirectUri: string | URL;

  /** Scopes to request, this overrides all default scopes from the provider config */
  scope?: string[];
}

/**
 * Combined configuration that may be supplied by the user.
 */
export type OAuthUserConfig =
  & Partial<OAuthEnvConfig>
  & Partial<OAuthPredefinedConfig>
  & OAuthVariableConfig;

/**
 * Complete configuration necessary for OAuth2 process.
 */
export type OAuthConfig =
  & OAuthEnvConfig
  & OAuthPredefinedConfig
  & OAuthVariableConfig
  & Partial<OAuthProviderInfo>;

/**
 * OAuth2 session
 */
export interface OAuthSession {
  state: string;
  codeVerifier: string;
  successUrl?: string;
}

/**
 * Tokens and associated information received from a successful access token request.
 */
export interface Tokens {
  accessToken: string;

  /**
   * The type of access token received.
   *
   * See https://tools.ietf.org/html/rfc6749#section-7.1
   * Should usually be "Bearer" for most OAuth 2.0 servers, but don't count on it.
   */
  tokenType: string;

  /** The lifetime in seconds of the access token. */
  expiresIn?: number;

  /**
   * The optional refresh token returned by the authorization server.
   *
   * Consult your OAuth 2.0 Provider's documentation to see under
   * which circumstances you'll receive one.
   */
  refreshToken?: string;

  /**
   * An optional id token if authenticated via OpenID Connect.
   * This should be a JWT.
   */
  idToken?: string;

  /**
   * The scopes that were granted by the user.
   *
   * May be undefined if the granted scopes match the requested scopes.
   * See https://tools.ietf.org/html/rfc6749#section-5.1
   */
  scope?: string[];
}
