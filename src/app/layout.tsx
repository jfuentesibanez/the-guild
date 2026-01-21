import type { Metadata } from "next";
import { Header } from "@/components/layout";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Guild",
  description: "Apprentice under winning bettors. Learn how they think. Build your edge.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <Header />
        {children}
      </body>
    </html>
  );
}
