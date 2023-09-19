// Copyright 2023 the Deno authors. All rights reserved. MIT license.

// For providers that have OAuth 2.0 configuration requirements
export type WithScope = { defaults: { scope: string | string[] } };
export type WithRedirectUri = { redirectUri: string };
