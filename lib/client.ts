import { signIn, type SignInOptions } from "./sign_in.ts";
import { handleCallback } from "./handle_callback.ts";
import { signOut } from "./sign_out.ts";
import type { Cookie, OAuth2ClientConfig } from "../deps.ts";

export interface ClientOptions {
  cookieOptions?: Partial<Cookie>;
}

export class Client {
  oauthConfig: OAuth2ClientConfig;
  options?: ClientOptions;

  constructor(oauthConfig: OAuth2ClientConfig, options?: ClientOptions) {
    this.oauthConfig = oauthConfig;
    this.options = options;
  }

  async signIn(request: Request, options?: SignInOptions) {
    return await signIn(request, this.oauthConfig, options);
  }

  async handleCallback(request: Request) {
    return await handleCallback(request, this.oauthConfig, {
      cookieOptions: this.options?.cookieOptions,
    });
  }

  async signOut(request: Request) {
    return await signOut(request, {
      cookieOptions: this.options?.cookieOptions,
    });
  }
}
