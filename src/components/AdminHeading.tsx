/**
 * The title block at the top of every admin page.
 *
 * Here because each page wrote its own, so the heading size, the spacing
 * under it and whether there was a sentence of explanation at all depended
 * on which page you had opened. A set of pages that look like one tool is
 * mostly a matter of them starting the same way.
 */
export function AdminHeading({
  title,
  children,
}: {
  title: string;
  /** One line on what this page is for. Optional, but almost always worth it. */
  children?: React.ReactNode;
}) {
  return (
    <div className="border-b border-border pb-5">
      <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">{title}</h1>
      {children && (
        <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted">{children}</p>
      )}
    </div>
  );
}
