import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Agent hybride africain (prototype)",
  description:
    "Prototype API + RAG local — assistant centré Afrique, réutilisable par Problem to Project Africa.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
