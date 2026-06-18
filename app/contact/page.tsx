import ContactView from "@/components/views/ContactView";
import { getSiteContent } from "@/lib/queries";
import type { ContactLocation, ContactPhoto, ContactSocial } from "@/types";

export const revalidate = 60;

export default async function ContactPage() {
  const [socials, location, photo] = await Promise.all([
    getSiteContent<ContactSocial[]>("contact_socials"),
    getSiteContent<ContactLocation>("contact_location"),
    getSiteContent<ContactPhoto>("contact_photo"),
  ]);

  return (
    <ContactView socials={socials ?? []} location={location} photo={photo} />
  );
}
