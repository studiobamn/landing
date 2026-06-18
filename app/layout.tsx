import type { Metadata } from "next";
import "../styles/globals.css";
import { Providers } from "@/components/Providers";
import { TransitionLayer } from "@/components/TransitionLayer";

export const metadata: Metadata = {
  title: "BAMN",
  description: "BAMN — architecture studio.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full">
        <Providers>{children}</Providers>
        <TransitionLayer />
      </body>
    </html>
  );
}
