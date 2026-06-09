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
        <nav className="border-b border-stone-800 bg-[#0a0a08]/95 backdrop-blur-sm sticky top-0 z-50">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <div className="flex h-14 items-center justify-between">
              <Link href="/" className="flex items-center gap-2.5">
                <span className="text-lg font-bold text-emerald-400 tracking-tight">Aisha</span>
                <span className="hidden text-xs text-stone-500 sm:block">Agent IA · Afrique subsaharienne</span>
              </Link>
              <div className="flex items-center gap-1">
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
      className="px-3 py-1.5 text-sm text-stone-400 hover:text-white hover:bg-stone-800 rounded transition-colors"
    >
      {children}
    </Link>
  );
}
