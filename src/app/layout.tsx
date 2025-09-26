import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/auth-context";

export const metadata: Metadata = {
  title: "Y Ddraig Goch Saloon - Welsh Dragon Management System",
  description: "Welsh-themed saloon management system for RedM roleplay community. Track sales, manage inventory, and monitor staff performance with Welsh pride.",
  keywords: "RedM, roleplay, welsh, saloon, dragon, management, POS, inventory, wales, cymru",
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
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
