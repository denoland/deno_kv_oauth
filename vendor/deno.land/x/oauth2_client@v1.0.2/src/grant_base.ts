import { OAuth2ResponseError, TokenResponseError } from "./errors.ts";
import type { OAuth2Client } from "./oauth2_client.ts";
import type { RequestOptions, Tokens } from "./types.ts";

interface AccessTokenResponse {
  "access_token": string;
  "token_type": string;
  "expires_in"?: number;
  "refresh_token"?: string;
  scope?: string;
}

/**
 * Base class for all grants.
 *
 * Contains methods useful to most if not all implementations of OAuth 2.0 grants.
 */
export abstract class OAuth2GrantBase {
  constructor(
    protected readonly client: OAuth2Client,
  ) {}

  protected buildRequest(
    baseUrl: string | URL,
    options: RequestOptions,
    overrideOptions: RequestOptions = {},
  ): Request {
    const url = this.toUrl(baseUrl);

    const clientDefaults = this.client.config.defaults?.requestOptions;

    const urlParams: Record<string, string> = {
      ...(clientDefaults?.urlParams),
      ...(options.urlParams ?? {}),
      ...(overrideOptions.urlParams ?? {}),
    };
    Object.keys(urlParams).forEach((key) => {
      url.searchParams.append(key, urlParams[key]);
    });

    const method = overrideOptions.method ??
      options.method ??
      "GET";

    return new Request(url.toString(), {
      method,
      headers: new Headers({
        "Content-Type": "application/x-www-form-urlencoded",
        ...(clientDefaults?.headers ?? {}),
        ...(options.headers ?? {}),
        ...(overrideOptions.headers ?? {}),
      }),
      body: method !== "HEAD" && method !== "GET"
        ? new URLSearchParams({
          ...(clientDefaults?.body ?? {}),
          ...(options.body ?? {}),
          ...(overrideOptions.body ?? {}),
        }).toString()
        : undefined,
    });
  }

  protected toUrl(url: string | URL): URL {
    if (typeof url === "string") {
      return new URL(url, "http://example.com");
    }
    return url;
  }

  protected async parseTokenResponse(response: Response): Promise<Tokens> {
    if (!response.ok) {
      throw await this.getTokenResponseError(response);
    }

    let body: AccessTokenResponse;
    try {
      body = await response.clone().json();
    } catch {
      throw new TokenResponseError(
        "Response is not JSON encoded",
        response,
      );
    }

    if (typeof body !== "object" || Array.isArray(body) || body === null) {
      throw new TokenResponseError(
        "body is not a JSON object",
        response,
      );
    }
    if (typeof body.access_token !== "string") {
      throw new TokenResponseError(
        body.access_token
          ? "access_token is not a string"
          : "missing access_token",
        response,
      );
    }
    if (typeof body.token_type !== "string") {
      throw new TokenResponseError(
        body.token_type ? "token_type is not a string" : "missing token_type",
        response,
      );
    }
    if (
      body.refresh_token !== undefined &&
      typeof body.refresh_token !== "string"
    ) {
      throw new TokenResponseError(
        "refresh_token is not a string",
        response,
      );
    }
    if (
      body.expires_in !== undefined && typeof body.expires_in !== "number"
    ) {
      throw new TokenResponseError(
        "expires_in is not a number",
        response,
      );
    }
    if (body.scope !== undefined && typeof body.scope !== "string") {
      throw new TokenResponseError(
        "scope is not a string",
        response,
      );
    }

    const tokens: Tokens = {
      accessToken: body.access_token,
      tokenType: body.token_type,
    };

    if (body.refresh_token) {
      tokens.refreshToken = body.refresh_token;
    }
    if (body.expires_in) {
      tokens.expiresIn = body.expires_in;
    }
    if (body.scope) {
      tokens.scope = body.scope.split(" ");
    }

    return tokens;
  }

  /** Tries to build an AuthError from the response and defaults to AuthServerResponseError if that fails. */
  private async getTokenResponseError(
    response: Response,
  ): Promise<OAuth2ResponseError | TokenResponseError> {
    try {
      const body = await response.json();
      if (typeof body.error !== "string") {
        throw new TypeError("body should contain an error");
      }
      return new OAuth2ResponseError(body);
    } catch {
      return new TokenResponseError(
        `Server returned ${response.status} and no error description was given`,
        response,
      );
    }
  }
}
