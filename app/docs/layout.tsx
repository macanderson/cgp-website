import { DocsSidebar } from "@/components/DocsSidebar";

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="shell docs-grid">
      <DocsSidebar />
      <article className="docs-article prose">{children}</article>
    </div>
  );
}
