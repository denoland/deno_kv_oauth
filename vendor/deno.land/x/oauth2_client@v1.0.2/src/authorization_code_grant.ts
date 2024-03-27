import type { OAuth2Client } from "./oauth2_client.ts";
import { AuthorizationResponseError, OAuth2ResponseError } from "./errors.ts";
import type { RequestOptions, Tokens } from "./types.ts";
import { OAuth2GrantBase } from "./grant_base.ts";
import { createPkceChallenge } from "./pkce.ts";

interface AuthorizationUriOptionsWithPKCE {
  /**
   * State parameter to send along with the authorization request.
   *
   * see https://tools.ietf.org/html/rfc6749#section-4.1.1
   */
  state?: string;
  /**
   * Scopes to request with the authorization request.
   *
   * If an array is passed, it is concatinated using spaces as per
   * https://tools.ietf.org/html/rfc6749#section-3.3
   */
  scope?: string | string[];
  /** Set to true to opt out of using PKCE */
  disablePkce?: false;
}

type AuthorizationUriOptionsWithoutPKCE =
  & Omit<AuthorizationUriOptionsWithPKCE, "disablePkce">
  & { disablePkce: true };

export type AuthorizationUriOptions =
  | AuthorizationUriOptionsWithPKCE
  | AuthorizationUriOptionsWithoutPKCE;

export interface AuthorizationUriWithoutVerifier {
  uri: URL;
}
export interface AuthorizationUriWithVerifier {
  uri: URL;
  codeVerifier: string;
}

export type AuthorizationUri =
  | AuthorizationUriWithVerifier
  | AuthorizationUriWithoutVerifier;

export interface AuthorizationCodeTokenOptions {
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
  /**
   * When using PKCE, the code verifier that you got by calling getAuthorizationUri
   */
  codeVerifier?: string;
  /** Request options used when making the access token request. */
  requestOptions?: RequestOptions;
}

/**
 * Implements the OAuth 2.0 authorization code grant.
 *
 * See https://tools.ietf.org/html/rfc6749#section-4.1
 */
export class AuthorizationCodeGrant extends OAuth2GrantBase {
  constructor(client: OAuth2Client) {
    super(client);
  }

  /**
   * Builds a URI you can redirect a user to to make the authorization request.
   *
   * By default, {@link https://www.rfc-editor.org/rfc/rfc7636 PKCE} will be used.
   * You can opt out of PKCE by passing `{ disablePkce: true }` in the options.
   *
   * When using PKCE it is your responsibility to store the returned `codeVerifier`
   * and associate it with the user's session just like with the `state` parameter.
   * You have to pass it to the `getToken()` request when you receive the
   * authorization callback or the token request will fail.
   */
  public getAuthorizationUri(
    options?: AuthorizationUriOptionsWithPKCE,
  ): Promise<AuthorizationUriWithVerifier>;
  public getAuthorizationUri(
    options: AuthorizationUriOptionsWithoutPKCE,
  ): Promise<AuthorizationUriWithoutVerifier>;
  public async getAuthorizationUri(
    options: AuthorizationUriOptions = {},
  ): Promise<AuthorizationUri> {
    const params = new URLSearchParams();
    params.set("response_type", "code");
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

    if (options.disablePkce === true) {
      return {
        uri: new URL(`?${params}`, this.client.config.authorizationEndpointUri),
      };
    }

    const challenge = await createPkceChallenge();
    params.set("code_challenge", challenge.codeChallenge);
    params.set("code_challenge_method", challenge.codeChallengeMethod);
    return {
      uri: new URL(`?${params}`, this.client.config.authorizationEndpointUri),
      codeVerifier: challenge.codeVerifier,
    };
  }

  /**
   * Parses the authorization response request tokens from the authorization server.
   *
   * Usually you'd want to call this method in the function that handles the user's request to your configured redirectUri.
   * @param authResponseUri The complete URI the user got redirected to by the authorization server after making the authorization request.
   *     Must include all received URL parameters.
   */
  public async getToken(
    authResponseUri: string | URL,
    options: AuthorizationCodeTokenOptions = {},
  ): Promise<Tokens> {
    const validated = await this.validateAuthorizationResponse(
      this.toUrl(authResponseUri),
      options,
    );

    const request = this.buildAccessTokenRequest(
      validated.code,
      options.codeVerifier,
      options.requestOptions,
    );

    const accessTokenResponse = await fetch(request);

    return this.parseTokenResponse(accessTokenResponse);
  }

  private async validateAuthorizationResponse(
    url: URL,
    options: AuthorizationCodeTokenOptions,
  ): Promise<{ code: string; state?: string }> {
    if (typeof this.client.config.redirectUri === "string") {
      const expectedUrl = new URL(this.client.config.redirectUri);

      if (
        typeof url.pathname === "string" &&
        url.pathname !== expectedUrl.pathname
      ) {
        throw new AuthorizationResponseError(
          `Redirect path should match configured path, but got: ${url.pathname}`,
        );
      }
    }

    if (!url.search || !url.search.substr(1)) {
      throw new AuthorizationResponseError(
        `URI does not contain callback parameters: ${url}`,
      );
    }

    const params = new URLSearchParams(url.search || "");

    if (params.get("error") !== null) {
      throw OAuth2ResponseError.fromURLSearchParams(params);
    }

    const code = params.get("code") || "";
    if (!code) {
      throw new AuthorizationResponseError(
        "Missing code, unable to request token",
      );
    }

    const state = params.get("state");
    const stateValidator = options.stateValidator ||
      (options.state && ((s) => s === options.state)) ||
      this.client.config.defaults?.stateValidator;

    if (stateValidator && !await stateValidator(state)) {
      if (state === null) {
        throw new AuthorizationResponseError("Missing state");
      } else {
        throw new AuthorizationResponseError(
          `Invalid state: ${params.get("state")}`,
        );
      }
    }

    if (state) {
      return { code, state };
    }
    return { code };
  }

  private buildAccessTokenRequest(
    code: string,
    codeVerifier?: string,
    requestOptions: RequestOptions = {},
  ): Request {
    const body: Record<string, string> = {
      "grant_type": "authorization_code",
      code,
    };
    const headers: Record<string, string> = {
      "Accept": "application/json",
    };

    if (typeof codeVerifier === "string") {
      body.code_verifier = codeVerifier;
    }

    if (typeof this.client.config.redirectUri === "string") {
      body.redirect_uri = this.client.config.redirectUri;
    }

    if (typeof this.client.config.clientSecret === "string") {
      // We have a client secret, authenticate using HTTP Basic Auth as described in RFC6749 Section 2.3.1.
      const { clientId, clientSecret } = this.client.config;
      headers.Authorization = `Basic ${btoa(`${clientId}:${clientSecret}`)}`;
    } else {
      // This appears to be a public client, include the client ID along in the body
      body.client_id = this.client.config.clientId;
    }

    return this.buildRequest(this.client.config.tokenUri, {
      method: "POST",
      headers,
      body,
    }, requestOptions);
  }
}
