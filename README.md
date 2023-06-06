# Deno KV OAuth

[![Docs](https://doc.deno.land/badge.svg)](https://doc.deno.land/https://deno.land/x/deno_kv_oauth/mod.ts)
[![CI](https://github.com/denoland/deno_kv_oauth/actions/workflows/ci.yml/badge.svg)](https://github.com/denoland/deno_kv_oauth/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/denoland/deno_kv_oauth/branch/main/graph/badge.svg?token=UZ570U128Z)](https://codecov.io/gh/denoland/deno_kv_oauth)

Minimal OAuth powered by Deno KV.

> Note: this project is in beta. API design and functionality are subject to
> change.

## Live Demo

You can check out the live demo, using GitHub as the OAuth provider, at
https://kv-oauth.deno.dev.

You can also check out a live demo at https://kv-oauth.deno.dev.

## Usage

### Provider OAuth2 Pre-configurations

This module comes with a suite of OAuth2 provider pre-configurations. To create
a pre-configured OAuth2 client, use `createClient(provider)` and define your
`${PROVIDER}_CLIENT_ID` and `${PROVIDER}_CLIENT_SECRET` environment variables.
E.g. for GitHub, your OAuth 2 client object would be set by:

```ts
// GITHUB_CLIENT_ID=xxx GITHUB_CLIENT_SECRET=xxx deno run --unstable --allow-env --allow-net ...
import { createClient } from "https://deno.land/x/deno_kv_oauth/mod.ts";

const client = createClient("github");
```

OAuth2 provider pre-configurations include (with their `provider` ID):

- Discord (`discord`)
- GitHub (`github`)
- GitLab (`gitlab`)
- Google (`google`)

> Note: providers differ in their required OAuth parameters. `createClient()`
> throws when required OAuth configuration parameters aren't provided.

### Custom OAuth2 Configurations

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
