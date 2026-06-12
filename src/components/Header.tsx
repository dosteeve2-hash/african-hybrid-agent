"use client";

import Link from "next/link";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--bg2)]/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--gold)] font-serif italic text-sm font-bold text-[var(--bg)]">
            A
          </div>
          <div className="hidden flex-col sm:flex">
            <span className="font-serif italic text-sm font-bold text-[var(--gold)]">Aisha</span>
            <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--text3)]">Agent v0.3</span>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <NavLink href="/">Chat</NavLink>
          <NavLink href="/corpus">Corpus</NavLink>
          <NavLink href="/monitoring">Monitor</NavLink>
          <NavLink href="/hub">Hub</NavLink>
        </nav>

        <a
          href="https://github.com/dosteeve2-hash/african-hybrid-agent"
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-[11px] uppercase tracking-widest text-[var(--text3)] transition-colors hover:text-[var(--gold)]"
        >
          GitHub ↗
        </a>
      </div>
    </header>
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
