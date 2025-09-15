import type { Metadata } from "next";
import "./globals.css";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";

export const metadata: Metadata = {
  title: "Starter Flask/Next Auth",
  description: "Fullstack starter sécurisé",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col bg-[var(--bg)] text-[var(--text)] transition-colors">
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-blue-600 text-white px-4 py-2 rounded shadow">Aller au contenu</a>
        <NavBar />
        <main id="main" className="flex-1 w-full px-4 py-8 max-w-6xl mx-auto focus:outline-none">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}


