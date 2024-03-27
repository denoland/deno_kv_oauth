export type HttpVerb =
  | "GET"
  | "HEAD"
  | "POST"
  | "PUT"
  | "DELETE"
  | "CONNECT"
  | "OPTIONS"
  | "TRACE"
  | "PATCH";

export interface RequestOptions {
  /** HTTP Method to use when performing outgoing HTTP requests.  */
  method?: HttpVerb;
  /** Headers to set when performing outgoing HTTP requests. */
  headers?: Record<string, string>;
  /** Body parameters to set when performing outgoing HTTP requests. */
  body?: Record<string, string>;
  /** URL parameters to set when performing outgoing HTTP requests. */
  urlParams?: Record<string, string>;
}

/** Tokens and associated information received from a successful access token request. */
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
   * The scopes that were granted by the user.
   *
   * May be undefined if the granted scopes match the requested scopes.
   * See https://tools.ietf.org/html/rfc6749#section-5.1
   */
  scope?: string[];
}
