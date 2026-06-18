import AboutView from "@/components/views/AboutView";
import { getSiteContentByPrefix } from "@/lib/queries";
import type { AboutContent } from "@/types";

export const revalidate = 60;

export default async function AboutPage() {
  // Each "about-<field>" row maps to one AboutContent field.
  const content = await getSiteContentByPrefix<AboutContent>("about-");
  return <AboutView content={content} />;
}
