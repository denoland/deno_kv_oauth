// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import { OAuth2Client } from "../dev_deps.ts";

// Dummy OAuth 2.0 client for testing only.
export const oauth2Client = new OAuth2Client({
  clientId: crypto.randomUUID(),
  clientSecret: crypto.randomUUID(),
  authorizationEndpointUri: "https://example.com/authorize",
  tokenUri: "https://example.com/token",
});
