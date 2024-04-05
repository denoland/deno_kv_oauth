import type { OAuth2Client } from "./oauth2_client.ts";
import { OAuth2GrantBase } from "./grant_base.ts";
import { AuthorizationResponseError, OAuth2ResponseError } from "./errors.ts";
import type { RequestOptions, Tokens } from "./types.ts";

export interface ImplicitUriOptions {
  /**
   * State parameter to send along with the authorization request.
   *
   * see https://tools.ietf.org/html/rfc6749#section-4.2.1
   */
  state?: string;
  /**
   * Scopes to request with the authorization request.
   *
   * If an array is passed, it is concatinated using spaces as per
   * https://tools.ietf.org/html/rfc6749#section-3.3
   */
  scope?: string | string[];
}

export interface ImplicitTokenOptions {
  /**
   * The state parameter expected to be returned by the authorization response.
   *
   * Usually you'd store the state you sent with the authorization request in the
   * user's session so you can pass it here.
   * If it could be one of many states or you want to run some custom verification
   * logic, use the `stateValidator` parameter instead.
   */
  state?: string;
  /**
   * The state validator used to verify that the received state is valid.
   *
   * The option object's state value is ignored when a stateValidator is passed.
   */
  stateValidator?: (state: string | null) => Promise<boolean> | boolean;
  /** Request options used when making the access token request. */
  requestOptions?: RequestOptions;
}

export class ImplicitGrant extends OAuth2GrantBase {
  constructor(client: OAuth2Client) {
    super(client);
  }

  /** Builds a URI you can redirect a user to to make the authorization request. */
  public getAuthorizationUri(options: ImplicitUriOptions = {}): URL {
    const params = new URLSearchParams();
    params.set("response_type", "token");
    params.set("client_id", this.client.config.clientId);
    if (typeof this.client.config.redirectUri === "string") {
      params.set("redirect_uri", this.client.config.redirectUri);
    }
    const scope = options.scope ?? this.client.config.defaults?.scope;
    if (scope) {
      params.set("scope", Array.isArray(scope) ? scope.join(" ") : scope);
    }
    if (options.state) {
      params.set("state", options.state);
    }
    return new URL(`?${params}`, this.client.config.authorizationEndpointUri);
  }

  /**
   * Parses the authorization response request tokens from the authorization server.
   *
   * Usually you'd want to call this method in the function that handles the user's request to your configured redirectUri.
   * @param authResponseUri The complete URI the user got redirected to by the authorization server after making the authorization request.
   *     Must include the fragment (sometimes also called "hash") of the URL.
   */
  public async getToken(
    authResponseUri: string | URL,
    options: ImplicitTokenOptions = {},
  ): Promise<Tokens> {
    const url = authResponseUri instanceof URL
      ? authResponseUri
      : new URL(authResponseUri);

    if (typeof this.client.config.redirectUri === "string") {
      const expectedUrl = new URL(this.client.config.redirectUri);

      if (
        typeof url.pathname === "string" &&
        url.pathname !== expectedUrl.pathname
      ) {
        throw new AuthorizationResponseError(
          `redirect path should match configured path, but got: ${url.pathname}`,
        );
      }
    }

    if (!url.hash || !url.hash.substring(1)) {
      throw new AuthorizationResponseError(
        `URI does not contain callback fragment parameters: ${url}`,
      );
    }

    const params = new URLSearchParams(url.hash.substring(1));

    if (params.get("error") !== null) {
      throw OAuth2ResponseError.fromURLSearchParams(params);
    }

    const accessToken = params.get("access_token");
    if (!accessToken) {
      throw new AuthorizationResponseError("missing access_token");
    }

    const tokenType = params.get("token_type");
    if (!tokenType) {
      throw new AuthorizationResponseError("missing token_type");
    }

    const state = params.get("state");
    const stateValidator = options.stateValidator ||
      (options.state && ((s) => s === options.state)) ||
      this.client.config.defaults?.stateValidator;

    const tokens: Tokens = {
      accessToken,
      tokenType,
    };

    const expiresInRaw = params.get("expires_in");
    if (expiresInRaw) {
      if (!expiresInRaw.match(/^\d+$/)) {
        throw new AuthorizationResponseError("expires_in is not a number");
      }
      tokens.expiresIn = parseInt(expiresInRaw, 10);
    }

    if (stateValidator && !await stateValidator(state)) {
      if (state === null) {
        throw new AuthorizationResponseError("missing state");
      } else {
        throw new AuthorizationResponseError(
          `invalid state: ${params.get("state")}`,
        );
      }
    }

    const scope = params.get("scope");
    if (scope) {
      tokens.scope = scope.split(" ");
    }

    return tokens;
  }
}
