import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "n8n Dashboard - Suivi des Automatisations",
  description: "Dashboard futuriste pour suivre la performance et la valeur générée par vos workflows n8n",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
