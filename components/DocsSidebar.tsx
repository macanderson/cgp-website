"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { DOCS, docHref } from "@/lib/docs";

export function DocsSidebar() {
  const pathname = usePathname();
  return (
    <aside className="docs-sidebar">
      <span className="eyebrow">
        <span className="tick">§</span> Documentation
      </span>
      <nav aria-label="Documentation">
        {DOCS.map((d) => {
          const href = docHref(d.slug);
          const current = pathname === href;
          return (
            <Link key={d.n} href={href} aria-current={current ? "page" : undefined}>
              <span className="n">{d.n}</span>
              <span>{d.title}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
