import type { Metadata } from "next";
import "../styles/globals.css";
import { Providers } from "@/components/Providers";
import { TransitionLayer } from "@/components/TransitionLayer";
import { HomeCoversHydrator } from "@/components/HomeCoversHydrator";
import { getSiteContent } from "@/lib/queries";
import type { HomeCovers } from "@/types";

export const metadata: Metadata = {
  title: "BAMN",
  description: "Architecture Studio.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const homeCovers = await getSiteContent<HomeCovers>("home_covers");

  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full">
        <Providers>
          <HomeCoversHydrator covers={homeCovers} />
          {children}
        </Providers>
        <TransitionLayer />
      </body>
    </html>
  );
}
