/**
 * Who shares an extension with whom.
 *
 * An extension is how a call gets filed against a person. Two people
 * on the same one is not a small mistake: the phone system reports
 * which extension made the call and nothing else, so every call either
 * of them makes is attributed to whichever of them is found first.
 * Nobody is told, nothing errors, and the record quietly becomes
 * fiction — which is the opposite of the reason any of this was built.
 *
 * It happened the first week: the owner's extension was typed onto
 * somebody else's account, and the only sign was a help page saying
 * the wrong number.
 *
 * No imports, so the page that draws the warning can use it directly.
 */

export type ExtensionHolder = { name: string; extension: string };

export type Clash = { extension: string; names: string[] };

/**
 * Extensions held by more than one person, with who holds them.
 *
 * Blank extensions are not a clash — plenty of people have no
 * extension and that is a different thing entirely.
 */
export function clashes(holders: ExtensionHolder[]): Clash[] {
  const byExtension = new Map<string, string[]>();

  for (const holder of holders) {
    const extension = holder.extension.trim();
    if (!extension) continue;
    const names = byExtension.get(extension) ?? [];
    names.push(holder.name);
    byExtension.set(extension, names);
  }

  return [...byExtension.entries()]
    .filter(([, names]) => names.length > 1)
    .map(([extension, names]) => ({ extension, names }))
    .sort((a, b) => a.extension.localeCompare(b.extension));
}

/** The warning, in words, or null when there is nothing wrong. */
export function clashWords(clash: Clash): string {
  const [first, ...rest] = clash.names;
  const others = rest.length === 1 ? rest[0] : `${rest.slice(0, -1).join(", ")} and ${rest.at(-1)}`;
  return `${first} and ${others} are both on extension ${clash.extension}. The phone system cannot tell their calls apart — every call from either of them will be filed against one of them.`;
}
