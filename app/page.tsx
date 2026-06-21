import HomeView from "@/components/views/HomeView";
import { getSiteContent } from "@/lib/queries";
import type { ContactSocial, HomeCovers, HomePoem } from "@/types";

export const revalidate = 60;

export default async function HomePage() {
  const [poem, covers, socials] = await Promise.all([
    getSiteContent<HomePoem>("home_poem"),
    getSiteContent<HomeCovers>("home_covers"),
    getSiteContent<ContactSocial[]>("contact_socials"),
  ]);
  return <HomeView poem={poem} covers={covers} socials={socials} />;
}
