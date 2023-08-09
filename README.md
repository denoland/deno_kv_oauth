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

- Uses [oauth2_client](https://deno.land/x/oauth2_client@v1.0.0) for OAuth 2.0
  workflows and [Deno KV](https://deno.com/kv) for persistent session storage.
- Automatically handles the authorization code flow with
  [Proof Key for Code Exchange (PKCE)](https://www.oauth.com/oauth2-servers/pkce/),
  access token refresh, and client redirection.
- Comes with
  [pre-configured OAuth 2.0 clients for popular providers](#pre-configured-oauth2-clients).
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
Github as the OAuth 2.0 provider. Source code is located in [demo.ts](demo.ts).

## Usage

Check out the full documentation and API reference
[here](https://doc.deno.land/https://deno.land/x/deno_kv_oauth/mod.ts).

### Getting Started

This example uses GitHub as the OAuth 2.0 provider. However, you can use any
provider you like.

1. Create your OAuth 2.0 application for your given provider.

1. Create your [pre-configured](#pre-configured-oauth-20-clients) or
   [custom OAuth 2.0 client instance](#custom-oauth-20-client).

   ```ts
   // Pre-configured OAuth 2.0 client
   import { createGitHubOAuth2Client } from "https://deno.land/x/deno_kv_oauth@$VERSION/mod.ts";

   const oauth2Client = createGitHubOAuth2Client();
   ```

1. Using the OAuth 2.0 client instance, insert the authentication flow functions
   into your authentication routes.

   ```ts
   // Sign-in, callback and sign-out handlers
   import {
     createGitHubOAuth2Client,
     handleCallback,
     signIn,
     signOut,
   } from "https://deno.land/x/deno_kv_oauth@$VERSION/mod.ts";

   const oauth2Client = createGitHubOAuth2Client();

   async function handleSignIn(request: Request) {
     return await signIn(request, oauth2Client);
   }

   async function handleOAuth2Callback(request: Request) {
     return await handleCallback(request, oauth2Client);
   }

   async function handleSignOut(request: Request) {
     return await signOut(request);
   }
   ```

1. Use Deno KV OAuth's helper functions where needed.

   ```ts
   // Protected route
   import {
     createGitHubOAuth2Client,
     getSessionAccessToken,
     getSessionId,
   } from "https://deno.land/x/deno_kv_oauth@$VERSION/mod.ts";

   const oauth2Client = createGitHubOAuth2Client();

   async function getGitHubUser(accessToken: string): Promise<any> {
     const response = await fetch("https://api.github.com/user", {
       headers: { authorization: `Bearer ${accessToken}` },
     });
     if (!response.ok) {
       const { message } = await response.json();
       throw new Error(message);
     }
     return await response.json();
   }

   async function handleAccountPage(request: Request) {
     const sessionId = getSessionId(request);
     const hasSessionIdCookie = sessionId !== undefined;

     if (!hasSessionIdCookie) return new Response(null, { status: 404 });

     const accessToken = await getSessionAccessToken(oauth2Client, sessionId);
     if (accessToken === null) return new Response(null, { status: 400 });

     try {
       const githubUser = await getGitHubUser(accessToken);
       return Response.json(githubUser);
     } catch (error) {
       console.error(error);
       return Response.error();
     }
   }
   ```

1. Start your server with the necessary
   [environment variables](#environment-variables).

   ```bash
   GITHUB_CLIENT_ID=xxx GITHUB_CLIENT_SECRET=xxx deno run --unstable --allow-env --allow-net server.ts
   ```

> Check out a full implementation in the [demo source code](./demo.ts).

1. When needed, you can delete all KV-stored OAuth 2.0 sessions and tokens.

   ```ts
   import { clearOAuthSessionsAndTokens } from "https://deno.land/x/deno_kv_oauth@$VERSION/mod.ts";

   await clearOAuthSessionsAndTokens();
   ```

### Pre-configured OAuth 2.0 Clients

This module comes with a suite of pre-configured OAuth 2.0 clients for the
following providers:

1. [Auth0](https://deno.land/x/deno_kv_oauth/mod.ts?s=createAuth0OAuth2Client)
1. [Discord](https://deno.land/x/deno_kv_oauth/mod.ts?s=createDiscordOAuth2Client)
1. [Dropbox](https://deno.land/x/deno_kv_oauth/mod.ts?s=createDropboxOAuth2Client)
1. [Facebook](https://deno.land/x/deno_kv_oauth/mod.ts?s=createFacebookOAuth2Client)
1. [GitHub](https://deno.land/x/deno_kv_oauth/mod.ts?s=createGitHubOAuth2Client)
1. [GitLab](https://deno.land/x/deno_kv_oauth/mod.ts?s=createGitLabOAuth2Client)
1. [Google](https://deno.land/x/deno_kv_oauth/mod.ts?s=createGoogleOAuth2Client)
1. [Notion](https://deno.land/x/deno_kv_oauth/mod.ts?s=createNotionOAuth2Client)
1. [Okta](https://deno.land/x/deno_kv_oauth/mod.ts?s=createOktaOAuth2Client)
1. [Patreon](https://deno.land/x/deno_kv_oauth/mod.ts?s=createPatreonOAuth2Client)
1. [Slack](https://deno.land/x/deno_kv_oauth/mod.ts?s=createSlackOAuth2Client)
1. [Spotify](https://deno.land/x/deno_kv_oauth/mod.ts?s=createSpotifyOAuth2Client)
1. [Twitter](https://deno.land/x/deno_kv_oauth/mod.ts?s=createTwitterOAuth2Client)

Each function is typed so that their respective platform's requirements are met.

> If there's a pre-configured OAuth 2.0 client for a provider you'd like added,
> please submit a pull request or
> [create a new issue](https://github.com/denoland/deno_kv_oauth/issues/new).

### Custom OAuth 2.0 Client

If you require custom OAuth 2.0 configuration, you must define your `client`
using
[`new OAuth2Client()`](https://deno.land/x/oauth2_client/mod.ts?s=OAuth2Client)
from the [`oauth2_client` module](https://deno.land/x/oauth2_client/mod.ts).
E.g.:

```ts
import { OAuth2Client } from "https://deno.land/x/oauth2_client/mod.ts";

const client = new OAuth2Client({
  clientId: Deno.env.get("CUSTOM_CLIENT_ID")!,
  clientSecret: Deno.env.get("CUSTOM_CLIENT_SECRET")!,
  authorizationEndpointUri: "https://custom.com/oauth/authorize",
  tokenUri: "https://custom.com/oauth/token",
  redirectUri: "https://my-site.com",
});
```

### Environment Variables

- `KV_PATH` (optional) - defines the path that Deno KV uses. See
  [the API reference](https://deno.land/api?s=Deno.openKv&unstable=) for further
  details.
- `${PROVIDER}_CLIENT_ID` and `${PROVIDER}_CLIENT_SECRET` - required when
  creating a pre-configured OAuth 2.0 client for a given provider. E.g. for
  Twitter, the environment variable keys are `TWITTER_CLIENT_ID` and
  `TWITTER_CLIENT_SECRET`. See
  [the list below](#pre-configured-oauth-20-clients) for specifics.
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

## Known Issues

### Twitch Incompatibility

This module is incompatible with [Twitch](https://www.twitch.tv/) as an OAuth
2.0 provider, as the platform
[doesn't support PKCE](https://twitch.uservoice.com/forums/310213-developers/suggestions/39785686-add-pkce-support-to-the-oauth2-0-authorization-cod).
[PKCE](https://oauth.net/2/pkce/) is a requirement for all OAuth 2.0 providers
for this module.

## In the Wild

Check out these projects powered by Deno KV OAuth 2.0:

1. [Deno SaaSKit / Deno Hunt](https://saaskit.deno.dev/) - A modern SaaS
   template built on Fresh.
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
1. [Paquet](https://paquet.app) - A web app shop

> Do you have a project powered by Deno KV OAuth 2.0 that you'd like to share?
> Please submit a pull request adding that project to this list.
