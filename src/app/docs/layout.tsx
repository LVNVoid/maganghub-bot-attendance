import { DocsLayout } from "fumadocs-ui/layouts/docs";
import { docsPageTree } from "@/lib/docs-tree";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import "fumadocs-ui/css/style.css";
import "fumadocs-ui/css/neutral.css";

export default function RootDocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-canvas text-ink-primary">
      <DocsLayout
        tree={docsPageTree}
        nav={{
          title: (
            <div className="flex items-center gap-2">
              <span className="text-primary font-mono text-base">🤖</span>
              <span className="font-semibold text-sm tracking-tight text-ink-primary">
                MagangHub Bot Docs
              </span>
            </div>
          ),
          url: "/docs",
        }}
        sidebar={{
          banner: (
            <div className="p-2 mb-2">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 text-xs text-ink-secondary hover:text-primary transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Kembali ke Dashboard</span>
              </Link>
            </div>
          ),
        }}
      >
        {children}
      </DocsLayout>
    </div>
  );
}
