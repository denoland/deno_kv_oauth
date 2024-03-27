import { RequestOptions, Tokens } from "./types.ts";
import { OAuth2Client } from "./oauth2_client.ts";
import { OAuth2GrantBase } from "./grant_base.ts";

export interface RefreshTokenOptions {
  scope?: string | string[];
  requestOptions?: RequestOptions;
}

/**
 * Implements the OAuth 2.0 refresh token grant.
 *
 * See https://tools.ietf.org/html/rfc6749#section-6
 */
export class RefreshTokenGrant extends OAuth2GrantBase {
  constructor(client: OAuth2Client) {
    super(client);
  }

  /** Request new tokens from the authorization server using the given refresh token. */
  async refresh(
    refreshToken: string,
    options: RefreshTokenOptions = {},
  ): Promise<Tokens> {
    const body: Record<string, string> = {
      "grant_type": "refresh_token",
      "refresh_token": refreshToken,
    };

    if (typeof (options?.scope) === "string") {
      body.scope = options.scope;
    } else if (Array.isArray(options?.scope)) {
      body.scope = options.scope.join(" ");
    }

    const headers: Record<string, string> = {
      "Accept": "application/json",
    };
    if (typeof this.client.config.clientSecret === "string") {
      // Note: RFC 6749 doesn't really say how a non-confidential client should
      // prove its identity when making a refresh token request, so we just don't
      // do anything and let the user deal with that (e.g. using the  requestOptions)
      const { clientId, clientSecret } = this.client.config;
      headers.Authorization = `Basic ${btoa(`${clientId}:${clientSecret}`)}`;
    }

    const req = this.buildRequest(this.client.config.tokenUri, {
      method: "POST",
      body,
      headers,
    }, options.requestOptions);

    const accessTokenResponse = await fetch(req);

    return this.parseTokenResponse(accessTokenResponse);
  }
}
