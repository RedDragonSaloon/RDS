import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Red Dragon - Management System",
  description: "Saloon management system for RedM roleplay community. Track sales, manage inventory, and monitor staff performance.",
  keywords: "RedM, roleplay, saloon, management, POS, inventory",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🐉</text></svg>" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
