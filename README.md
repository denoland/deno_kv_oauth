<div align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" width="300" height="240" srcset="./logo-dark.svg">
    <source media="(prefers-color-scheme: light)" width="300" height="240" srcset="./logo-light.svg">
    <img alt="Deno KV OAuth logo" width="300" height="240" src="./logo-light.svg">
  </picture>

<p>High-level OAuth 2.0 powered by <a href="https://deno.com/kv">Deno KV</a>.</p>

<a href="https://doc.deno.land/https://deno.land/x/deno_kv_oauth/mod.ts">
  <img src="https://doc.deno.land/badge.svg" alt="Docs">
</a>
<a href="https://github.com/denoland/deno_kv_oauth/actions/workflows/ci.yml">
  <img src="https://github.com/denoland/deno_kv_oauth/actions/workflows/ci.yml/badge.svg" alt="CI">
</a>
<a href="https://codecov.io/gh/denoland/deno_kv_oauth">
  <img src="https://codecov.io/gh/denoland/deno_kv_oauth/branch/main/graph/badge.svg?token=UZ570U128Z" alt="codecov">
</a>

</div>

# Deno KV OAuth (Beta)

## Features

- Uses [oauth2_client](https://deno.land/x/oauth2_client@v1.0.0) for OAuth
  workflows and [Deno KV](https://deno.com/kv) for persistent session storage.
- Automatically handles the authorization code flow with
  [Proof Key for Code Exchange (PKCE)](https://www.oauth.com/oauth2-servers/pkce/)
  and client redirection.
- Comes with
  [pre-defined OAuth configurations for popular providers](#pre-defined-oauth-configurations).
- Works locally and in the cloud, including
  [Deno Deploy](https://deno.com/deploy).
- Based on the
  [`Request`](https://developer.mozilla.org/en-US/docs/Web/API/Request) and
  [`Response`](https://developer.mozilla.org/en-US/docs/Web/API/Response)
  interfaces from the
  [Web API](https://developer.mozilla.org/en-US/docs/Web/API).
- Works with
  [std/http's `serve()`](https://deno.land/std@0.192.0/http/mod.ts?s=serve) and
  [`Deno.serve()`](https://deno.land/api?s=Deno.serve&unstable=) native HTTP
  servers, and web frameworks such as [Fresh](https://fresh.deno.dev/) and
  [Oak](https://oakserver.github.io/oak/). See the [In the Wild](#in-the-wild)
  section below for examples and demos.

## Live Demo

You can also check out a live demo at https://kv-oauth.deno.dev, which uses
Github as the OAuth provider. Source code is located in [demo.ts](demo.ts).

## Usage

Check out the full documentation and API reference
[here](https://doc.deno.land/https://deno.land/x/deno_kv_oauth/mod.ts).

### Getting Started with [Fresh](https://fresh.deno.dev/)

> Note: The minimum required version for plugins in Fresh is 1.3.0 If you're not
> performing anything special in the sign-in, sign-out and callback handlers,
> you can add the Fresh plugin to your project. This automatically handles
> `GET /oauth/signin`, `GET /oauth/callback` and `GET /oauth/signout` routes.

1. Create your OAuth 2.0 application for your given provider.

1. Create your [pre-defined](#pre-defined-oauth-configurations) or
   [custom](#custom-oauth-configuration) OAuth configuration and configure Fresh
   to use the plugin.

   ```ts
   // main.ts
   import { start } from "$fresh/server.ts";
   import {
     createGithubOAuthConfig,
     kvOAuthPlugin,
   } from "https://deno.land/x/deno_kv_oauth@$VERSION/mod.ts";
   import manifest from "./fresh.gen.ts";

   await start(manifest, {
     plugins: [
       kvOAuthPlugin(createGithubOAuthConfig()),
     ],
   });
   ```

If you require more advanced setups, you can create your own plugin. For more
information, see:

- The [source code](src/fresh_plugin.ts) for `kvOAuthPlugin()`
- The [Plugin documentation](https://fresh.deno.dev/docs/concepts/plugins) for
  Fresh
- The
  [Fresh + Deno KV OAuth demo](https://github.com/denoland/fresh-deno-kv-oauth-demo)
  which uses the Fresh plugin
- [Deno SaaSKit](https://saaskit.deno.dev/)'s custom
  [plugin implementation](https://github.com/denoland/saaskit/blob/3accffdc44c2d2eb6dba28126f8d4cb525eba340/plugins/kv_oauth.ts)

### Getting Started with Other Frameworks

This example uses GitHub as the OAuth provider. However, you can use any
provider you like.

1. Create your OAuth application for your given provider.

1. Create your web server using Deno KV OAuth's request handlers and helpers.

   ```ts
   // server.ts
   import {
     createGitHubOAuthConfig,
     handleCallback,
     signIn,
     signOut,
   } from "https://deno.land/x/deno_kv_oauth@$VERSION/mod.ts";

   const oauthConfig = createGitHubOAuthConfig();

   async function handler(request: Request) {
     const { pathname } = new URL(request.url);
     switch (pathname) {
       case "/oauth/signin":
         return await signIn(request, oauthConfig);
       case "/oauth/callback":
         return await handleCallback(request, oauthConfig);
       case "/oauth/signout":
         return signOut(request);
       case "/protected-route":
         return getSessionId(request) === undefined
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
   GITHUB_CLIENT_ID=xxx GITHUB_CLIENT_SECRET=xxx deno run --unstable --allow-env --allow-net server.ts
   ```

> Check out a full implementation in the [demo source code](./demo.ts).

### Pre-Defined OAuth Configurations

This module comes with a suite of pre-defined OAuth configurations for the
following providers:

1. [Auth0](https://deno.land/x/deno_kv_oauth/mod.ts?s=createAuth0OAuthConfig)
1. [Discord](https://deno.land/x/deno_kv_oauth/mod.ts?s=createDiscordOAuthConfig)
1. [Dropbox](https://deno.land/x/deno_kv_oauth/mod.ts?s=createDropboxOAuthConfig)
1. [Facebook](https://deno.land/x/deno_kv_oauth/mod.ts?s=createFacebookOAuthConfig)
1. [GitHub](https://deno.land/x/deno_kv_oauth/mod.ts?s=createGitHubOAuthConfig)
1. [GitLab](https://deno.land/x/deno_kv_oauth/mod.ts?s=createGitLabOAuthConfig)
1. [Google](https://deno.land/x/deno_kv_oauth/mod.ts?s=createGoogleOAuthConfig)
1. [Notion](https://deno.land/x/deno_kv_oauth/mod.ts?s=createNotionOAuthConfig)
1. [Okta](https://deno.land/x/deno_kv_oauth/mod.ts?s=createOktaOAuthConfig)
1. [Patreon](https://deno.land/x/deno_kv_oauth/mod.ts?s=createPatreonOAuthConfig)
1. [Slack](https://deno.land/x/deno_kv_oauth/mod.ts?s=createSlackOAuthConfig)
1. [Spotify](https://deno.land/x/deno_kv_oauth/mod.ts?s=createSpotifyOAuthConfig)
1. [Twitter](https://deno.land/x/deno_kv_oauth/mod.ts?s=createTwitterOAuthConfig)

Each function is typed so that their respective platform's requirements are met.

> If there's a pre-configured OAuth client for a provider you'd like added,
> please submit a pull request or
> [create a new issue](https://github.com/denoland/deno_kv_oauth/issues/new).

### Custom OAuth Configuration

Custom OAuth must be defined using
[`OAuth2ClientConfig`](https://deno.land/x/oauth2_client/mod.ts?s=OAuth2ClientConfig)
from the [`oauth2_client` module](https://deno.land/x/oauth2_client/mod.ts).
E.g.:

```ts
import type { OAuth2ClientConfig } from "https://deno.land/x/oauth2_client/mod.ts";

const oauthConfig: OAuth2ClientConfig = {
  clientId: Deno.env.get("CUSTOM_CLIENT_ID")!,
  clientSecret: Deno.env.get("CUSTOM_CLIENT_SECRET")!,
  authorizationEndpointUri: "https://custom.com/oauth/authorize",
  tokenUri: "https://custom.com/oauth/token",
  redirectUri: "https://my-site.com",
};
```

### Environment Variables

- `DENO_KV_PATH` (optional) - defines the path that Deno KV uses. See
  [the API reference](https://deno.land/api?s=Deno.openKv&unstable=) for further
  details.
- `${PROVIDER}_CLIENT_ID` and `${PROVIDER}_CLIENT_SECRET` - required when
  creating a pre-configured OAuth client for a given provider. E.g. for Twitter,
  the environment variable keys are `TWITTER_CLIENT_ID` and
  `TWITTER_CLIENT_SECRET`. See
  [the list below](#pre-defined-oauth-configurations) for specifics.
- `OKTA_DOMAIN` or `AUTH0_DOMAIN` - required only when using the Okta or Auth0
  provider to supply your own given domain.

> Note: reading environment variables requires the
> `--allow-env[=<VARIABLE_NAME>...]` permission flag. See
> [the manual](https://deno.com/manual/basics/permissions) for further details.

### Running the Demo

Run `deno task demo` to start the demo application. The task uses environment
variables defined in a `.env` file at the root of this folder.

By default, the demo uses GitHub with a minimal scope. Use the `PROVIDER` and
`SCOPE` environment variables, if you'd like to change this behavior. E.g. for
Twitter:

```bash
PROVIDER=Twitter SCOPE=users.read deno task demo
```

### Redirect URL after Sign-In or Sign-Out

The URL that the client is redirected to upon successful sign-in or sign-out is
determined by the request made to the sign-in or sign-out endpoint. This value
is set by the following order of precedence:

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

The same applies to user sign-out.

## Known Issues

### Twitch Incompatibility

This module is incompatible with [Twitch](https://www.twitch.tv/) as an OAuth
2.0 provider, as the platform
[doesn't support PKCE](https://twitch.uservoice.com/forums/310213-developers/suggestions/39785686-add-pkce-support-to-the-oauth2-0-authorization-cod).
[PKCE](https://oauth.net/2/pkce/) is a requirement for all OAuth providers for
this module.

## In the Wild

Check out these projects powered by Deno KV OAuth:

1. [Deno SaaSKit](https://saaskit.deno.dev/) - A modern SaaS template built on
   Fresh.
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

> Do you have a project powered by Deno KV OAuth that you'd like to share?
> Please submit a pull request adding that project to this list.
