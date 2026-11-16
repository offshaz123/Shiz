import { existsSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

/**
 * Lets the test runner import the app's TypeScript the same way Next does.
 *
 * Two jobs:
 *
 *  - Extensionless relative imports. `./foo` has to become `./foo.ts`,
 *    `./foo.tsx` or `./foo/index.ts`, because the source is written for a
 *    bundler that fills those in and node will not guess.
 *  - The `@/` alias, which is `src/` per tsconfig paths. Without this, any
 *    module that reaches a content file is untestable: importing one pure
 *    function out of lib pulls in its whole import graph, and the first
 *    `@/content/...` in that graph fails the run with a missing-package
 *    error that looks nothing like the actual problem.
 */

const SRC = new URL("../src/", import.meta.url);
const EXTENSIONS = [".ts", ".tsx", "/index.ts", "/index.tsx", ".mjs", ".js"];

function firstThatExists(base) {
  if (existsSync(fileURLToPath(base))) return base;
  for (const ext of EXTENSIONS) {
    const candidate = new URL(base.href + ext);
    if (existsSync(fileURLToPath(candidate))) return candidate;
  }
  return null;
}

export async function resolve(specifier, context, next) {
  if (specifier.startsWith("@/")) {
    const resolved = firstThatExists(new URL(specifier.slice(2), SRC));
    if (resolved) return next(resolved.href, context);
  }

  if (specifier.startsWith(".") && !/\.[a-z]+$/i.test(specifier)) {
    const parent = context.parentURL
      ? new URL(specifier, context.parentURL)
      : pathToFileURL(path.resolve(specifier));
    const resolved = firstThatExists(parent);
    // Hand back the original shape where it already worked, so this stays a
    // superset of what it replaced rather than a rewrite of the behaviour.
    if (resolved) return next(resolved.href, context);
  }

  return next(specifier, context);
}
