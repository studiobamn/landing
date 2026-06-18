import HomeView from "@/components/views/HomeView";
import { getSiteContent } from "@/lib/queries";
import type { HomeCovers, HomePoem } from "@/types";

export const revalidate = 60;

export default async function HomePage() {
  const [poem, covers] = await Promise.all([
    getSiteContent<HomePoem>("home_poem"),
    getSiteContent<HomeCovers>("home_covers"),
  ]);
  return <HomeView poem={poem} covers={covers} />;
}
