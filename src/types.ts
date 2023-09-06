export interface OAuthEnvConfig {
  /** The client ID provided by the authorization server. */
  clientId: string;

  /** The client secret provided by the authorization server, if using a confidential client. */
  clientSecret: string;
}

export interface OAuthProviderConfig {
  /** The name of the provider (single PascalCase name that matches the function name and uppercase env var prefix) */
  name: string;
}

export interface OAuthPredefinedConfig {
  /** The URI of the authorization server's authorization endpoint. */
  authorizationEndpointUri: string;

  /** The URI of the authorization server's token endpoint. */
  tokenUri: string;
}

export interface OAuthVariableConfig {
  /** The URI of the client's redirection endpoint (sometimes also called callback URI). */
  redirectUri: string;

  /** Scopes to request. */
  scope: string | string[];

  /** Headers to set when performing outgoing HTTP requests. */
  headers?: Record<string, string>;

  /** Body parameters to set when performing outgoing HTTP requests. */
  body?: Record<string, string>;

  /** URL parameters to set when performing outgoing HTTP requests. */
  urlParams?: Record<string, string>;

  /** State validator to use for validating the authorization response's state value. */
  stateValidator?: (state: string | null) => Promise<boolean> | boolean;
}

export type OAuthUserConfig =
  & Partial<OAuthEnvConfig & OAuthPredefinedConfig>
  & OAuthVariableConfig;

export type OAuthConfig =
  & OAuthEnvConfig
  & OAuthPredefinedConfig
  & OAuthVariableConfig
  & Partial<OAuthProviderConfig>;

// OAuth 2.0 session
export interface OAuthSession {
  state: string;
  codeVerifier: string;
  successUrl?: string;
}
