// Copyright 2023-2024 the Deno authors. All rights reserved. MIT license.
/**
 * Returns the environment variable with the given key after ensuring that it's
 * been set in the current process. This can be used when defining a custom
 * OAuth configuration.
 *
 * @example Usage
 * ```ts ignore
 * import { getRequiredEnv } from "jsr:@deno/kv-oauth";
 *
 * getRequiredEnv("HOME"); // Returns "/home/alice"
 * ```
 */
export function getRequiredEnv(key: string): string {
  const value = Deno.env.get(key);
  if (value === undefined) {
    throw new Error(`"${key}" environment variable must be set`);
  }
  return value;
}
