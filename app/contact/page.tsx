import ContactView from "@/components/views/ContactView";
import { getSiteContent } from "@/lib/queries";
import type {
  ContactInquiries,
  ContactLocation,
  ContactPhoto,
  ContactSocial,
} from "@/types";

export const revalidate = 60;

export default async function ContactPage() {
  const [socials, location, photo, inquiries] = await Promise.all([
    getSiteContent<ContactSocial[]>("contact_socials"),
    getSiteContent<ContactLocation>("contact_location"),
    getSiteContent<ContactPhoto>("contact_photo"),
    getSiteContent<ContactInquiries>("contact_inquiries"),
  ]);

  return (
    <ContactView
      socials={socials ?? []}
      location={location}
      photo={photo}
      inquiries={inquiries}
    />
  );
}
