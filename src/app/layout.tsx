import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Partners | Life Planner",
  description: "Osobný finančný plánovač a konzultačný nástroj",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sk" className="h-full">
      <body className="min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)] transition-colors duration-200 antialiased">
        {children}
      </body>
    </html>
  );
}
