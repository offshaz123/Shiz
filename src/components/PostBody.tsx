import Link from "next/link";
import type { ReactNode } from "react";

// Turns **bold** and [text](/link) into elements.
function inline(text: string, key: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /\*\*(.+?)\*\*|\[(.+?)\]\((.+?)\)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const k = `${key}-${m.index}`;
    if (m[1]) out.push(<strong key={k}>{inline(m[1], k)}</strong>);
    else if (m[3].startsWith("/"))
      out.push(
        <Link key={k} href={m[3]} className="font-semibold text-[#8a6a12] underline underline-offset-2">
          {m[2]}
        </Link>,
      );
    else
      out.push(
        <a key={k} href={m[3]} rel="noopener" className="font-semibold text-[#8a6a12] underline underline-offset-2">
          {m[2]}
        </a>,
      );
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

// The simple formatting used in blog posts: paragraphs, "## " headings,
// "- " bullets and "1. " numbered steps.
export function PostBody({ body }: { body: string }) {
  return (
    <div className="prose-plate">
      {body.split(/\n\s*\n/).map((block, i) => {
        const lines = block.trim().split("\n");
        const key = `b${i}`;
        if (lines[0].startsWith("## ")) return <h2 key={key}>{inline(lines[0].slice(3), key)}</h2>;
        if (lines.every((l) => l.startsWith("- ")))
          return (
            <ul key={key}>
              {lines.map((l, j) => (
                <li key={j}>{inline(l.slice(2), `${key}-${j}`)}</li>
              ))}
            </ul>
          );
        if (lines.every((l) => /^\d+\. /.test(l)))
          return (
            <ol key={key} className="my-2 list-decimal space-y-1 pl-5">
              {lines.map((l, j) => (
                <li key={j}>{inline(l.replace(/^\d+\. /, ""), `${key}-${j}`)}</li>
              ))}
            </ol>
          );
        return <p key={key}>{inline(lines.join(" "), key)}</p>;
      })}
    </div>
  );
}
