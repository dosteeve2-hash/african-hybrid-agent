"use client";

import Link from "next/link";
import { useState } from "react";

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-stone-800 bg-[#0a0d0b]/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600">
            <span className="text-sm font-bold text-white">🌍</span>
          </div>
          <div className="hidden flex-col sm:flex">
            <span className="text-sm font-bold text-white">African Hybrid</span>
            <span className="text-xs text-stone-500">Agent v0.3</span>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link href="/" className="text-sm font-medium text-stone-400 hover:text-white">Chat</Link>
          <Link href="/corpus" className="text-sm font-medium text-stone-400 hover:text-white">Corpus</Link>
          <Link href="/monitoring" className="text-sm font-medium text-stone-400 hover:text-white">Monitor</Link>
        </nav>

        <a href="https://github.com/dosteeve2-hash/african-hybrid-agent" target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-stone-400 hover:text-white">GitHub ↗</a>
      </div>
    </header>
  );
}
