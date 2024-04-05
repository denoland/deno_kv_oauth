import { OAuth2GrantBase } from "./grant_base.ts";
import type { OAuth2Client } from "./oauth2_client.ts";
import type { RequestOptions, Tokens } from "./types.ts";

export interface ResourceOwnerPasswordCredentialsTokenOptions {
  /** The resource owner username */
  username: string;
  /** The resource owner password */
  password: string;
  /**
   * Scopes to request with the authorization request.
   *
   * If an array is passed, it is concatinated using spaces as per
   * https://tools.ietf.org/html/rfc6749#section-3.3
   */
  scope?: string | string[];

  requestOptions?: RequestOptions;
}

/**
 * Implements the OAuth 2.0 resource owner password credentials grant.
 *
 * See https://tools.ietf.org/html/rfc6749#section-4.3
 */
export class ResourceOwnerPasswordCredentialsGrant extends OAuth2GrantBase {
  constructor(client: OAuth2Client) {
    super(client);
  }

  /**
   * Uses the username and password to request an access and optional refresh token
   */
  public async getToken(
    options: ResourceOwnerPasswordCredentialsTokenOptions,
  ): Promise<Tokens> {
    const request = this.buildTokenRequest(options);

    const accessTokenResponse = await fetch(request);

    return this.parseTokenResponse(accessTokenResponse);
  }

  private buildTokenRequest(
    options: ResourceOwnerPasswordCredentialsTokenOptions,
  ): Request {
    const body: Record<string, string> = {
      "grant_type": "password",
      username: options.username,
      password: options.password,
    };
    const headers: Record<string, string> = {
      "Accept": "application/json",
    };

    const scope = options.scope ?? this.client.config.defaults?.scope;
    if (scope) {
      if (Array.isArray(scope)) {
        body.scope = scope.join(" ");
      } else {
        body.scope = scope;
      }
    }

    if (typeof this.client.config.clientSecret === "string") {
      // We have a client secret, authenticate using HTTP Basic Auth as described in RFC6749 Section 2.3.1.
      const { clientId, clientSecret } = this.client.config;
      headers.Authorization = `Basic ${btoa(`${clientId}:${clientSecret}`)}`;
    } else {
      // This appears to be a public client, include the client ID in the body instead
      body.client_id = this.client.config.clientId;
    }

    return this.buildRequest(this.client.config.tokenUri, {
      method: "POST",
      headers,
      body,
    }, options.requestOptions);
  }
}
