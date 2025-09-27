import "./globals.css";
import React from "react";

export const metadata = {
  title: "BolsaBar",
  description: "Dynamic drink prices for your bar",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-zinc-100 text-zinc-900">{children}</body>
    </html>
  );
}
