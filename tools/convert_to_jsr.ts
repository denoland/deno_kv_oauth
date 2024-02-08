import { walk } from "std/fs/walk.ts";
import denoConfig from "../deno.json" with { type: "json" };

const STD_SPECIFIER_REGEX =
  /https:\/\/deno\.land\/std@(\d+\.\d+\.\d+)\/(\w+)\/(.+)\.ts/g;
const DKO_X_SPECIFIER = "https://deno.land/x/deno_kv_oauth/mod.ts";
const DKO_JSR_SPECIFIER = `jsr:${denoConfig.name}`;

function toStdJsrSpecifier(
  _full: string,
  version: string,
  module: string,
  path: string,
): string {
  return path === "mod"
    ? `jsr:@std/${module}@${version}`
    : `jsr:@std/${module}@${version}/${path}`;
}

for await (
  const entry of walk(".", {
    includeDirs: false,
    exts: [".ts", ".md", ".json"],
    skip: [/.github/, /tools/],
    followSymlinks: false,
  })
) {
  const text = await Deno.readTextFile(entry.path);
  const newText = text
    .replaceAll(STD_SPECIFIER_REGEX, toStdJsrSpecifier)
    .replaceAll(DKO_X_SPECIFIER, DKO_JSR_SPECIFIER);
  await Deno.writeTextFile(entry.path, newText);
}
