import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Assistant IA - Chatbot",
  description: "Discutez avec un assistant IA intelligent propulsé par n8n",
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
