import type { Metadata } from "next";
import { STIX_Two_Text, IBM_Plex_Mono } from "next/font/google";
import Link from "next/link";
import { Mark, BrandLockup } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

const serif = STIX_Two_Text({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-serif",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Context Graph Protocol — a typed graph substrate for agent context",
    template: "%s · Context Graph Protocol",
  },
  description:
    "The Context Graph Protocol (CGP) is an open specification for representing, exchanging, and accounting for LLM agent context as a typed graph of frames. Spec, JSON schemas, conformance suite, and SDKs for TypeScript, Python, and Go.",
  keywords: [
    "Context Graph Protocol",
    "CGP",
    "agent context",
    "context engineering",
    "LLM agents",
    "typed graph",
    "context frames",
    "token accounting",
    "open protocol",
    "context retrieval",
    "provenance",
  ],
  authors: [{ name: "Context Graph Protocol contributors" }],
  openGraph: {
    type: "website",
    siteName: "Context Graph Protocol",
    url: SITE_URL,
    title: "Context Graph Protocol",
    description:
      "An open specification for representing, exchanging, and accounting for LLM agent context as a typed graph of frames.",
    images: [{ url: "/og/og-home.png", width: 1200, height: 630, alt: "Context Graph Protocol" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Context Graph Protocol",
    description:
      "An open specification for representing, exchanging, and accounting for LLM agent context as a typed graph of frames.",
    images: ["/og/og-home.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  alternates: { canonical: "./" },
};

const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Context Graph Protocol",
  url: SITE_URL,
  logo: `${SITE_URL}/brand/cgp-mark-light.svg`,
  sameAs: [
    "https://github.com/macanderson/context-graph-protocol",
    "https://www.npmjs.com/package/@contextgraphprotocol/typescript-sdk",
  ],
};

const siteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Context Graph Protocol",
  url: SITE_URL,
  description:
    "Open specification and technical documentation for the Context Graph Protocol (CGP), a typed graph substrate for portable LLM agent context.",
};

const themeInit = `(function(){try{var q=new URLSearchParams(location.search).get("theme");var t=q==="dark"||q==="light"?q:localStorage.getItem("cgp-theme");if(!t){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";}document.documentElement.dataset.theme=t;}catch(e){document.documentElement.dataset.theme="light";}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd) }}
        />
      </head>
      <body className={`${serif.variable} ${mono.variable}`}>
        <header className="site-header">
          <div className="shell site-header-inner">
            <Link href="/" className="brand-link" aria-label="Context Graph Protocol home">
              <BrandLockup />
            </Link>
            <nav className="site-nav" aria-label="Site">
              <Link href="/docs">Docs</Link>
              <Link href="/research">Research</Link>
              <Link href="/brand">Brand</Link>
              <a
                href="https://github.com/macanderson/context-graph-protocol"
                target="_blank"
                rel="noopener"
              >
                GitHub ↗
              </a>
              <ThemeToggle />
            </nav>
          </div>
        </header>
        <main>{children}</main>
        <footer className="site-footer">
          <div className="shell">
            <div className="footer-grid">
              <div className="footer-brand">
                <Mark size={34} title="Context Graph Protocol mark" />
                <p>
                  An open wire protocol for context retrieval — typed,
                  budgeted, provenance-carrying frames that a host composes
                  into a prompt it can trust as evidence.
                </p>
              </div>
              <div className="footer-col">
                <span className="eyebrow">Protocol</span>
                <Link href="/docs">Introduction</Link>
                <Link href="/docs/concepts">Core concepts</Link>
                <Link href="/docs/wire-protocol">Wire protocol</Link>
                <Link href="/docs/conformance">Conformance</Link>
              </div>
              <div className="footer-col">
                <span className="eyebrow">Resources</span>
                <a href="https://github.com/macanderson/context-graph-protocol" target="_blank" rel="noopener">
                  Specification ↗
                </a>
                <a
                  href="https://www.npmjs.com/package/@contextgraphprotocol/typescript-sdk"
                  target="_blank"
                  rel="noopener"
                >
                  TypeScript SDK ↗
                </a>
                <Link href="/docs/sdks">All SDKs</Link>
                <a href="/llms.txt">llms.txt</a>
              </div>
              <div className="footer-col">
                <span className="eyebrow">Site</span>
                <Link href="/research">Research</Link>
                <Link href="/brand">Brand</Link>
                <a href="/papers/context-graph-protocol.pdf">Whitepaper (PDF)</a>
                <a href="/sitemap.xml">Sitemap</a>
              </div>
            </div>
            <div className="footer-legal">
              <span>© 2026 Context Graph Protocol contributors</span>
              <span>Specification licensed MIT OR Apache-2.0</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
