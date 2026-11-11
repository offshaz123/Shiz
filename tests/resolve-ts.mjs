/**
 * Lets `node --test` follow the project's extensionless imports.
 *
 * The source is written the way Next.js wants it — `import { x } from
 * "./site-audit"` — which Node's ESM resolver refuses, because it wants an
 * extension. Node can already run the TypeScript itself with
 * --experimental-strip-types, so the only thing missing is the extension,
 * and that is twenty lines rather than a test-runner dependency that would
 * then be installed on every deploy.
 */
import { register } from "node:module";
register("./resolve-ts-hooks.mjs", import.meta.url);
