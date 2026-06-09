import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Agent Academy",
  description: "Build, evaluate, harden, and ship production-minded AI agent systems.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
