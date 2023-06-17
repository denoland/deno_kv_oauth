# Deno KV OAuth

[![Docs](https://doc.deno.land/badge.svg)](https://doc.deno.land/https://deno.land/x/deno_kv_oauth/mod.ts)
[![CI](https://github.com/denoland/deno_kv_oauth/actions/workflows/ci.yml/badge.svg)](https://github.com/denoland/deno_kv_oauth/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/denoland/deno_kv_oauth/branch/main/graph/badge.svg?token=UZ570U128Z)](https://codecov.io/gh/denoland/deno_kv_oauth)

Minimal [OAuth 2.0](https://oauth.net/2/) powered by
[Deno KV](https://deno.com/kv).

> Note: this project is in beta. API design and functionality are subject to
> change.

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

## Live Demo

You can also check out a live demo at https://kv-oauth.deno.dev, which uses
Github as the OAuth 2.0 provider. Source code is located in [demo.ts](demo.ts).

## Usage

### Getting Started

1. Download [demo.ts](demo.ts).
1. Define your `client` object using one of the
   [pre-configured OAuth 2.0 clients](#pre-configured-oauth2-clients) or a
   [custom OAuth 2.0 client](#custom-oauth2-client).
1. Run the script with the appropriate environment variables and permission
   flags defined. E.g. for GitHub:
   ```
   GITHUB_CLIENT_ID=xxx GITHUB_CLIENT_SECRET=xxx deno run --unstable --allow-env --allow-net demo.ts
   ```

### API Reference

Check out the full documentation and API reference
[here](https://doc.deno.land/https://deno.land/x/deno_kv_oauth/mod.ts).

### Environment Variables

- `KV_PATH` (optional) - defines the path that Deno KV uses. See
  [the API reference](https://deno.land/api?s=Deno.openKv&unstable=) for further
  details.
- `${PROVIDER}_CLIENT_ID` and `${PROVIDER}_CLIENT_SECRET` - required when
  creating a pre-configured OAuth 2.0 client for a given provider. E.g. for
  Twitter, the environment variable keys are `TWITTER_CLIENT_ID` and
  `TWITTER_CLIENT_SECRET`. See
  [the list below](#pre-configured-oauth-20-clients) for specifics.

> Note: reading environment variables requires the
> `--allow-env[=<VARIABLE_NAME>...]` permission flag. See
> [the manual](https://deno.com/manual/basics/permissions) for further details.

### Pre-configured OAuth 2.0 Clients

This module comes with a suite of pre-configured OAuth 2.0 clients for the
following providers:

1. [Discord](https://deno.land/x/deno_kv_oauth/mod.ts?s=createDiscordOAuth2Client)
1. [Dropbox](https://deno.land/x/deno_kv_oauth/mod.ts?s=createDropboxOAuth2Client)
1. [Facebook](https://deno.land/x/deno_kv_oauth/mod.ts?s=createFacebookOAuth2Client)
1. [GitHub](https://deno.land/x/deno_kv_oauth/mod.ts?s=createGitHubOAuth2Client)
1. [GitLab](https://deno.land/x/deno_kv_oauth/mod.ts?s=createGitLabOAuth2Client)
1. [Google](https://deno.land/x/deno_kv_oauth/mod.ts?s=createGoogleOAuth2Client)
1. [Patreon](https://deno.land/x/deno_kv_oauth/mod.ts?s=createPatreonOAuth2Client)
1. [Slack](https://deno.land/x/deno_kv_oauth/mod.ts?s=createSlackOAuth2Client)
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

## Contributing

Before submitting a pull request, please run `deno task ok` and ensure all
checks pass. This checks formatting, linting, types and runs tests.

## In the Wild

Check out these projects powered by Deno KV OAuth 2.0:

1. [Deno SaaSKit / Deno Hunt](https://saaskit.deno.dev/) - A modern SaaS
   template built on Fresh.
1. [KV SketchBook](https://hashrock-kv-sketchbook.deno.dev/) - Dead simple
   sketchbook app.

> Do you have a project powered by Deno KV OAuth 2.0 that you'd like to share?
> Please submit a pull request adding that project to this list.
