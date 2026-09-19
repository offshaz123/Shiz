/**
 * Defining `openGraph` in a page's metadata replaces the file-based
 * opengraph-image rather than merging with it, so every page that set its own
 * OG title lost the share image. Pages point at the generated image
 * explicitly through this constant instead.
 */
export const ogImage = "/opengraph-image";
