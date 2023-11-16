// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import { walk } from "std/fs/walk.ts";

const CHECK = Deno.args.includes("--check");
const CURRENT_YEAR = new Date().getFullYear();
const COPYRIGHT =
  `// Copyright ${CURRENT_YEAR} the Deno authors. All rights reserved. MIT license.\n`;

async function checkLicense(path: string) {
  const content = await Deno.readTextFile(path);
  if (content.startsWith(COPYRIGHT)) return;
  if (CHECK) {
    throw new Error(`Missing copyright header: ${path}`);
  } else {
    await Deno.writeTextFile(path, COPYRIGHT + content);
  }
}

for await (
  const { path } of walk(new URL("../", import.meta.url), {
    exts: [".ts"],
    includeDirs: false,
  })
) {
  checkLicense(path);
}
