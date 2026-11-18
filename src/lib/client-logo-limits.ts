/**
 * The one number the browser and the server both need.
 *
 * Its own module with no imports, because the upload form runs in the
 * browser and the module that stores the bytes imports the database
 * driver. A browser importing that would pull MySQL into the page bundle,
 * and two copies of the limit is how a file passes in the form and is
 * then refused by the server.
 */

/** A logo on an invoice; anything larger is a photograph by mistake. */
export const MAX_LOGO_BYTES = 400_000;
