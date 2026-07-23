import Link from "next/link";
import { docHref, docNeighbors } from "@/lib/docs";

export function DocsPager({ slug }: { slug: string }) {
  const { prev, next } = docNeighbors(slug);
  return (
    <nav className="docs-pager" aria-label="Documentation pages">
      {prev ? (
        <Link href={docHref(prev.slug)}>
          <span className="k">← Previous</span>
          <span className="t">{prev.title}</span>
        </Link>
      ) : (
        <span />
      )}
      {next ? (
        <Link href={docHref(next.slug)} className="next">
          <span className="k">Next →</span>
          <span className="t">{next.title}</span>
        </Link>
      ) : null}
    </nav>
  );
}
