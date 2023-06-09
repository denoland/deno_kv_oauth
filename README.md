# Deno KV OAuth

[![Docs](https://doc.deno.land/badge.svg)](https://doc.deno.land/https://deno.land/x/deno_kv_oauth/mod.ts)
[![CI](https://github.com/denoland/deno_kv_oauth/actions/workflows/ci.yml/badge.svg)](https://github.com/denoland/deno_kv_oauth/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/denoland/deno_kv_oauth/branch/main/graph/badge.svg?token=UZ570U128Z)](https://codecov.io/gh/denoland/deno_kv_oauth)

Minimal OAuth powered by [Deno KV](https://deno.com/kv).

> Note: this project is in beta. API design and functionality are subject to
> change.

## Features

- Uses [Deno KV](https://deno.com/kv) for storage of session data.
- Automatically refreshes access tokens
- Uses authorization code flow with
  [Proof Key for Code Exchange (PKCE)](https://www.oauth.com/oauth2-servers/pkce/).
- [A suite of pre-configured OAuth2 clients for popular providers](#pre-configured-oauth2-clients).
- Straightforward API which aims to require minimal input.
- Works locally, in the cloud and on [Deno Deploy](https://deno.com/deploy).

## Live Demo

You can also check out a live demo at https://kv-oauth.deno.dev, which uses
Github as the OAuth2 provider. Source code is located in [demo.ts](demo.ts).

## Usage

### Getting Started

1. Download [demo.ts](demo.ts).
1. Define your `client` object using one of the
   [pre-configured OAuth2 clients](#pre-configured-oauth2-clients) or a
   [custom OAuth2 client](#custom-oauth2-client).
1. Run the script with the appropriate environment variables and permission
   flags defined. E.g. for GitHub:
   ```
   GITHUB_CLIENT_ID=xxx GITHUB_CLIENT_SECRET=xxx deno run --unstable --allow-env --allow-net demo.ts
   ```

### Pre-configured OAuth2 Clients

This module comes with a suite of pre-configured OAuth2 clients for the
following providers (and their provider IDs):

1. Discord (`discord`)
1. GitHub (`github`)
1. GitLab (`gitlab`)
1. Google (`google`)
1. Slack (`slack`)

> If there's a pre-configured OAuth2 client for a provider you'd like added,
> please submit a pull request or
> [create a new issue](https://github.com/denoland/deno_kv_oauth/issues/new).

To create a pre-configured OAuth2 client, use `createClient()` and define your
`${PROVIDER}_CLIENT_ID` and `${PROVIDER}_CLIENT_SECRET` environment variables.
E.g. for GitHub, your OAuth2 client object would be done by:

```ts
// GITHUB_CLIENT_ID=xxx GITHUB_CLIENT_SECRET=xxx deno run --unstable --allow-env --allow-net ...
import { createClient } from "https://deno.land/x/deno_kv_oauth/mod.ts";

const client = createClient("github");
```

Pass a 2nd paramter to `createClient()` to extend the OAuth2 client
configuration. E.g. for Discord, extending the OAuth2 client object would be
done by:

```ts
// DISCORD_CLIENT_ID=xxx DISCORD_CLIENT_SECRET=xxx deno run --unstable --allow-env --allow-net ...
import { createClient } from "https://deno.land/x/deno_kv_oauth/mod.ts";

const client = createClient("discord", {
  redirectUri: "http://localhost:8000/callback",
  defaults: {
    scope: "identify",
  },
});
```

> Note: providers differ in their required OAuth parameters. `createClient()`
> throws when required OAuth configuration parameters aren't provided.

### Custom OAuth2 Client

If you require custom OAuth2 configuration, you must define your `client` using
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

Check out these projects powered by Deno KV OAuth:

1. [Deno SaaSKit / Deno Hunt](https://saaskit.deno.dev/) - A modern SaaS
   template built on Fresh.
1. [KV SketchBook](https://hashrock-kv-sketchbook.deno.dev/) - Dead simple
   sketchbook app.

> Do you have a project powered by Deno KV OAuth that you'd like to share?
> Please submit a pull request adding that project to this list.
