# Deno KV OAuth (Beta)

[![JSR](https://jsr.io/badges/@deno/kv-oauth)](https://jsr.io/@deno/kv-oauth)
[![CI](https://github.com/denoland/deno_kv_oauth/actions/workflows/ci.yml/badge.svg)](https://github.com/denoland/deno_kv_oauth/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/denoland/deno_kv_oauth/branch/main/graph/badge.svg?token=UZ570U128Z)](https://codecov.io/gh/denoland/deno_kv_oauth)
[![Built with the Deno Standard Library](https://raw.githubusercontent.com/denoland/deno_std/main/badge.svg)](https://deno.land/std)

High-level OAuth 2.0 powered by [Deno KV](https://deno.com/kv).

## Features

- Uses [Deno KV](https://deno.com/kv) for persistent session storage.
- Uses [oauth2_client](https://deno.land/x/oauth2_client) for OAuth workflows.
- Automatically handles the authorization code flow with
  [Proof Key for Code Exchange (PKCE)](https://www.oauth.com/oauth2-servers/pkce/)
  and client redirection.
- Provides [pre-defined OAuth configurations](#pre-defined-oauth-configurations)
  for popular providers.
- Works locally and in the cloud, including
  [Deno Deploy](https://deno.com/deploy).
- Based on the [Web API](https://developer.mozilla.org/en-US/docs/Web/API)'s
  [`Request`](https://developer.mozilla.org/en-US/docs/Web/API/Request) and
  [`Response`](https://developer.mozilla.org/en-US/docs/Web/API/Response)
  interfaces.
- Works with [Fresh](https://fresh.deno.dev/),
  [`Deno.serve()`](https://deno.land/api?s=Deno.serve&unstable=) and
  [Oak](https://oakserver.github.io/oak/) and other web frameworks.
- Supports [custom session cookie options](#get-started-with-cookie-options)

## Documentation

Check out the full documentation and API reference
[here](https://jsr.io/@deno/kv-oauth/doc).

## How-to

### Get Started with a Pre-Defined OAuth Configuration

See [here](#providers) for the list of OAuth providers with pre-defined
configurations.

1. Create your OAuth application for your given provider.

1. Create your web server using Deno KV OAuth's request handlers, helpers and
   pre-defined OAuth configuration.

   ```ts ignore
   // server.ts
   import { createGitHubOAuthConfig, createHelpers } from "jsr:@deno/kv-oauth";

   const oauthConfig = createGitHubOAuthConfig();
   const {
     signIn,
     handleCallback,
     getSessionId,
     signOut,
   } = createHelpers(oauthConfig);

   async function handler(request: Request) {
     const { pathname } = new URL(request.url);
     switch (pathname) {
       case "/oauth/signin":
         return await signIn(request);
       case "/oauth/callback":
         const { response } = await handleCallback(request);
         return response;
       case "/oauth/signout":
         return await signOut(request);
       case "/protected-route":
         return await getSessionId(request) === undefined
           ? new Response("Unauthorized", { status: 401 })
           : new Response("You are allowed");
       default:
         return new Response(null, { status: 404 });
     }
   }

   Deno.serve(handler);
   ```

1. Start your server with the necessary
   [environment variables](#environment-variables).

   ```bash
   GITHUB_CLIENT_ID=xxx GITHUB_CLIENT_SECRET=xxx deno run --unstable-kv --allow-env --allow-net server.ts
   ```

> Check out a full implementation in the [demo source code](./demo.ts) which
> runs https://kv-oauth.deno.dev.

### Get Started with a Custom OAuth Configuration

1. Create your OAuth application for your given provider.

1. Create your web server using Deno KV OAuth's request handlers and helpers,
   and custom OAuth configuration.

   ```ts ignore
   // server.ts
   import {
     createHelpers,
     getRequiredEnv,
     type OAuth2ClientConfig,
   } from "jsr:@deno/kv-oauth";

   const oauthConfig: OAuth2ClientConfig = {
     clientId: getRequiredEnv("CUSTOM_CLIENT_ID"),
     clientSecret: getRequiredEnv("CUSTOM_CLIENT_SECRET"),
     authorizationEndpointUri: "https://custom.com/oauth/authorize",
     tokenUri: "https://custom.com/oauth/token",
     redirectUri: "https://my-site.com/another-dir/callback",
   };
   const {
     signIn,
     handleCallback,
     getSessionId,
     signOut,
   } = createHelpers(oauthConfig);

   async function handler(request: Request) {
     const { pathname } = new URL(request.url);
     switch (pathname) {
       case "/oauth/signin":
         return await signIn(request);
       case "/another-dir/callback":
         const { response } = await handleCallback(request);
         return response;
       case "/oauth/signout":
         return await signOut(request);
       case "/protected-route":
         return await getSessionId(request) === undefined
           ? new Response("Unauthorized", { status: 401 })
           : new Response("You are allowed");
       default:
         return new Response(null, { status: 404 });
     }
   }

   Deno.serve(handler);
   ```

1. Start your server with the necessary
   [environment variables](#environment-variables).

   ```bash
   CUSTOM_CLIENT_ID=xxx CUSTOM_CLIENT_SECRET=xxx deno run --unstable-kv --allow-env --allow-net server.ts
   ```

### Get Started with Cookie Options

This is required for OAuth solutions that span more than one sub-domain.

1. Create your OAuth application for your given provider.

1. Create your web server using Deno KV OAuth's helpers factory function with
   cookie options defined.

   ```ts ignore
   // server.ts
   import { createGitHubOAuthConfig, createHelpers } from "jsr:@deno/kv-oauth";

   const {
     signIn,
     handleCallback,
     signOut,
     getSessionId,
   } = createHelpers(createGitHubOAuthConfig(), {
     cookieOptions: {
       name: "__Secure-triple-choc",
       domain: "news.site",
     },
   });

   async function handler(request: Request) {
     const { pathname } = new URL(request.url);
     switch (pathname) {
       case "/oauth/signin":
         return await signIn(request);
       case "/oauth/callback":
         const { response } = await handleCallback(request);
         return response;
       case "/oauth/signout":
         return await signOut(request);
       case "/protected-route":
         return await getSessionId(request) === undefined
           ? new Response("Unauthorized", { status: 401 })
           : new Response("You are allowed");
       default:
         return new Response(null, { status: 404 });
     }
   }

   Deno.serve(handler);
   ```

1. Start your server with the necessary
   [environment variables](#environment-variables).

   ```bash
   GITHUB_CLIENT_ID=xxx GITHUB_CLIENT_SECRET=xxx deno run --unstable-kv --allow-env --allow-net server.ts
   ```

### Get Started with [Fresh](https://fresh.deno.dev/)

1. Create your OAuth application for your given provider.

1. Create your OAuth configuration and Fresh plugin.

   ```ts ignore
   // plugins/kv_oauth.ts
   import { createGitHubOAuthConfig, createHelpers } from "jsr:@deno/kv-oauth";
   import type { Plugin } from "$fresh/server.ts";

   const { signIn, handleCallback, signOut, getSessionId } = createHelpers(
     createGitHubOAuthConfig(),
   );

   export default {
     name: "kv-oauth",
     routes: [
       {
         path: "/signin",
         async handler(req) {
           return await signIn(req);
         },
       },
       {
         path: "/callback",
         async handler(req) {
           // Return object also includes `accessToken` and `sessionId` properties.
           const { response } = await handleCallback(req);
           return response;
         },
       },
       {
         path: "/signout",
         async handler(req) {
           return await signOut(req);
         },
       },
       {
         path: "/protected",
         async handler(req) {
           return await getSessionId(req) === undefined
             ? new Response("Unauthorized", { status: 401 })
             : new Response("You are allowed");
         },
       },
     ],
   } as Plugin;
   ```

1. [Add the plugin to your Fresh app.](https://fresh.deno.dev/docs/concepts/plugins)

1. Start your Fresh server with the necessary
   [environment variables](#environment-variables).

   ```bash
   GITHUB_CLIENT_ID=xxx GITHUB_CLIENT_SECRET=xxx deno task start
   ```

### Run the Demo Locally

The demo uses GitHub as the OAuth provider. You can change the OAuth
configuration by setting the `oauthConfig` constant as mentioned above.

1. Create your OAuth application for your given provider.

1. Start the demo with the necessary
   [environment variables](#environment-variables).

   ```bash
   TWITTER_CLIENT_ID=xxx TWITTER_CLIENT_SECRET=xxx deno task demo
   ```

## Concepts

### Redirects after Sign-In and Sign-Out

The URL that the client is redirected to upon successful sign-in or sign-out is
determined by the request made to the sign-in or sign-out endpoint. This value
is set in the following order of precedence:

1. The value of the `success_url` URL parameter of the request URL, if defined.
   E.g. a request to `http://example.com/signin?success_url=/success` redirects
   the client to `/success` after successful sign-in.
2. The value of the
   [`Referer`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referer)
   header, if of the same origin as the request. E.g. a request to
   `http://example.com/signin` with `Referer` header `http://example.com/about`
   redirects the client to `http://example.com/about` after successful sign-in.
3. The root path, "/". E.g. a request to `http://example.com/signin` without the
   `Referer` header redirects the client to `http://example.com` after
   successful sign-in.

### Pre-Defined OAuth Configurations

#### Providers

The following providers have pre-defined OAuth configurations:

1. [Auth0](https://jsr.io/@deno/kv-oauth/doc/~/createAuth0OAuthConfig)
1. [AWS Cognito User Pool](https://jsr.io/@deno/kv-oauth/doc/~/createAwsCognitoOAuthConfig)
1. [AzureAD](https://jsr.io/@deno/kv-oauth/doc/~/createAzureADAuthConfig)
1. [AzureADB2C](https://jsr.io/@deno/kv-oauth/doc/~/createAzureADB2CAuthConfig)
1. [Clerk](https://jsr.io/@deno/kv-oauth/doc/~/createClerkOAuthConfig)
1. [Discord](https://jsr.io/@deno/kv-oauth/doc/~/createDiscordOAuthConfig)
1. [Dropbox](https://jsr.io/@deno/kv-oauth/doc/~/createDropboxOAuthConfig)
1. [Facebook](https://jsr.io/@deno/kv-oauth/doc/~/createFacebookOAuthConfig)
1. [GitHub](https://jsr.io/@deno/kv-oauth/doc/~/createGitHubOAuthConfig)
1. [GitLab](https://jsr.io/@deno/kv-oauth/doc/~/createGitLabOAuthConfig)
1. [Google](https://jsr.io/@deno/kv-oauth/doc/~/createGoogleOAuthConfig)
1. [Logto](https://jsr.io/@deno/kv-oauth/doc/~/createLogtoOAuthConfig)
1. [Notion](https://jsr.io/@deno/kv-oauth/doc/~/createNotionOAuthConfig)
1. [Okta](https://jsr.io/@deno/kv-oauth/doc/~/createOktaOAuthConfig)
1. [Patreon](https://jsr.io/@deno/kv-oauth/doc/~/createPatreonOAuthConfig)
1. [Slack](https://jsr.io/@deno/kv-oauth/doc/~/createSlackOAuthConfig)
1. [Spotify](https://jsr.io/@deno/kv-oauth/doc/~/createSpotifyOAuthConfig)
1. [Twitter](https://jsr.io/@deno/kv-oauth/doc/~/createTwitterOAuthConfig)

#### Environment Variables

These must be set when starting a server with a pre-defined OAuth configuration.
Replace the `PROVIDER` prefix with your given OAuth provider's name when
starting your server. E.g. `DISCORD`, `GOOGLE`, or `SLACK`.

1. `PROVIDER_CLIENT_ID` -
   [Client ID](https://www.oauth.com/oauth2-servers/client-registration/client-id-secret/)
   of a given OAuth application.
1. `PROVIDER_CLIENT_SECRET` -
   [Client secret](https://www.oauth.com/oauth2-servers/client-registration/client-id-secret/)
   of a given OAuth application.
1. `PROVIDER_DOMAIN` (optional) - Server domain of a given OAuth application.
   Required for Auth0, AzureADB2C, AWS Cognito, and Okta.

> Note: reading environment variables requires the
> `--allow-env[=<VARIABLE_NAME>...]` permission flag. See
> [the manual](https://deno.com/manual/basics/permissions) for further details.

## Built with Deno KV OAuth

1. [Deno KV OAuth live demo]()
1. [Deno SaaSKit](https://saaskit.deno.dev/) - A modern SaaS template built on
   Fresh and uses a custom Deno KV OAuth plugin.
1. [KV SketchBook](https://hashrock-kv-sketchbook.deno.dev/) - Dead simple
   sketchbook app.
1. [Fresh + Deno KV OAuth demo](https://github.com/denoland/fresh-deno-kv-oauth-demo) -
   A demo of Deno KV OAuth working in the
   [Fresh web framework](https://fresh.deno.dev/).
1. [Oak + Deno KV OAuth demo](https://dash.deno.com/playground/oak-deno-kv-oauth-demo) -
   A demo of Deno KV OAuth working in the
   [Oak web framework](https://oakserver.github.io/oak/).
1. [Ultra + Deno KV OAuth demo](https://github.com/mbhrznr/ultra-deno-kv-oauth-demo) -
   A demo of Deno KV OAuth working in the
   [Ultra web framework](https://ultrajs.dev/).
1. [Hono + Deno KV OAuth demo](https://dash.deno.com/playground/hono-deno-kv-oauth) -
   A demo of Deno KV OAuth working in the
   [Hono web framework](https://hono.dev/).
1. [Cheetah + Deno KV OAuth demo](https://dash.deno.com/playground/cheetah-deno-kv-oauth) -
   A demo of Deno KV OAuth working in the
   [Cheetah web framework](https://cheetah.mod.land/).
1. [Paquet](https://paquet.app) - A web app shop
1. [Fastro + Deno KV OAuth live demo](https://fastro.dev/auth) - A simple,
   reusable fastro module that implements Deno KV.

> Do you have a project powered by Deno KV OAuth that you'd like to share? Feel
> free to let us know in a new issue.

## Known Issues

- Twitch is not supported as an OAuth provider because it does not support PKCE.
  See #79 and
  [this post](https://twitch.uservoice.com/forums/310213-developers/suggestions/39785686-add-pkce-support-to-the-oauth2-0-authorization-cod)
  for more information.

## Contributing Guide

Check out the contributing guide [here](.github/CONTRIBUTING.md).

## Security Policy

Check out the security policy [here](.github/SECURITY.md).
