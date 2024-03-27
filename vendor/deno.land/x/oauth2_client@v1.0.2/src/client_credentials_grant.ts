import { MissingClientSecretError } from "./errors.ts";
import { OAuth2GrantBase } from "./grant_base.ts";
import type { OAuth2Client } from "./oauth2_client.ts";
import { RequestOptions, Tokens } from "./types.ts";

export interface ClientCredentialsTokenOptions {
  /**
   * Scopes to request with the authorization request.
   *
   * If an array is passed, it is concatinated using spaces as per
   * https://tools.ietf.org/html/rfc6749#section-3.3
   */
  scope?: string | string[];

  /** Request options used when making the access token request. */
  requestOptions?: RequestOptions;
}

/**
 * Implements the OAuth 2.0 Client Credentials grant.
 *
 * See https://tools.ietf.org/html/rfc6749#section-4.4
 */
export class ClientCredentialsGrant extends OAuth2GrantBase {
  constructor(client: OAuth2Client) {
    super(client);
  }

  /**
   * Uses the clientId and clientSecret to request an access token
   */
  public async getToken(
    options: ClientCredentialsTokenOptions = {},
  ): Promise<Tokens> {
    const request = this.buildTokenRequest(options);

    const accessTokenResponse = await fetch(request);

    return this.parseTokenResponse(accessTokenResponse);
  }

  private buildTokenRequest(
    options: ClientCredentialsTokenOptions,
  ): Request {
    const { clientId, clientSecret } = this.client.config;
    if (typeof clientSecret !== "string") {
      throw new MissingClientSecretError();
    }

    const body: Record<string, string> = {
      "grant_type": "client_credentials",
    };
    const headers: Record<string, string> = {
      "Accept": "application/json",
      // We have a client secret, authenticate using HTTP Basic Auth as described in RFC6749 Section 2.3.1.
      "Authorization": `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
    };

    const scope = options.scope ?? this.client.config.defaults?.scope;
    if (scope) {
      if (Array.isArray(scope)) {
        body.scope = scope.join(" ");
      } else {
        body.scope = scope;
      }
    }

    return this.buildRequest(this.client.config.tokenUri, {
      method: "POST",
      headers,
      body,
    }, options.requestOptions);
  }
}
