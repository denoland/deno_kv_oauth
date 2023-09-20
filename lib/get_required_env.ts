// Copyright 2023 the Deno authors. All rights reserved. MIT license.

/**
 * Returns the environment variable with the given key after ensuring that it's
 * been set in the current process.
 *
 * This can be used when defining a custom OAuth configuration.
 *
 * @example
 * ```
 * import { getRequiredEnv } from "https://deno.land/x/deno_kv_oauth@$VERSION/src/providers/get_required_env.ts";
 *
 * getRequiredEnv("HOME"); // Returns "/home/alice"
 * ```
 */
export function getRequiredEnv(key: string) {
  const value = Deno.env.get(key);
  if (value === undefined) {
    throw new Error(`"${key}" environment variable must be set`);
  }
  return value;
}
