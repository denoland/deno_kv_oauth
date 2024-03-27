interface ErrorResponseParams {
  error: string;
  "error_description"?: string;
  "error_uri"?: string;
  state?: string;
}

/** Thrown when trying to use a grant that requires the client secret to be set */
export class MissingClientSecretError extends Error {
  constructor() {
    super("this grant requires a clientSecret to be set");
  }
}

/** Generic error returned by an OAuth 2.0 authorization server. */
export class OAuth2ResponseError extends Error {
  public readonly error: string;
  public readonly errorDescription?: string;
  public readonly errorUri?: string;
  public readonly state?: string;

  constructor(response: ErrorResponseParams) {
    super(response.error_description || response.error);

    this.error = response.error;
    this.errorDescription = response.error_description;
    this.errorUri = response.error_uri;
    this.state = response.state;
  }

  public static fromURLSearchParams(params: URLSearchParams) {
    const error = params.get("error");
    if (error === null) {
      throw new TypeError("error URL parameter must be set");
    }
    const response: ErrorResponseParams = {
      error: params.get("error") as string,
    };

    const description = params.get("error_description");
    if (description !== null) {
      response.error_description = description;
    }

    const uri = params.get("error_uri");
    if (uri !== null) {
      response.error_uri = uri;
    }

    const state = params.get("state");
    if (state !== null) {
      response.state = state;
    }

    return new OAuth2ResponseError(response);
  }
}

/** Error originating from the authorization response. */
export class AuthorizationResponseError extends Error {
  constructor(description: string) {
    super(`Invalid authorization response: ${description}`);
  }
}

/** Error originating from the token response. */
export class TokenResponseError extends Error {
  public readonly response: Response;

  constructor(description: string, response: Response) {
    super(`Invalid token response: ${description}`);
    this.response = response;
  }
}
