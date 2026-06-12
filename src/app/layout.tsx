import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Aisha — Agent IA Africain",
  description:
    "Agent IA anti-biais spécialisé sur l'Afrique subsaharienne. RAG sémantique, sources locales vérifiées, intégration Problem to Project Africa.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="min-h-screen antialiased">
        <nav className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--bg2)]/95 backdrop-blur-sm">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <div className="flex h-14 items-center justify-between">
              <Link href="/" className="flex items-center gap-2.5">
                <span className="font-serif italic text-lg font-bold text-[var(--gold)]">Aisha</span>
                <span className="hidden font-mono text-[10px] uppercase tracking-widest text-[var(--text3)] sm:block">
                  Agent IA · Afrique subsaharienne
                </span>
              </Link>
              <div className="flex items-center gap-0.5">
                <NavLink href="/">Chat</NavLink>
                <NavLink href="/corpus">Corpus</NavLink>
                <NavLink href="/monitoring">Analytics</NavLink>
                <NavLink href="/hub">Hub</NavLink>
                <NavLink href="/test">API</NavLink>
              </div>
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded px-3 py-1.5 font-mono text-[11px] uppercase tracking-widest text-[var(--text3)] transition-colors hover:bg-[var(--bg3)] hover:text-[var(--gold)]"
    >
      {children}
    </Link>
  );
}
