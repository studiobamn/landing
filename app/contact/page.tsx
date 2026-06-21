import ContactView from "@/components/views/ContactView";
import { getSiteContent } from "@/lib/queries";
import type { ContactLocation, ContactPhoto, ContactSocial } from "@/types";
import type { ContactFormConfig } from "@/components/contact/ContactForm";

export const revalidate = 60;

const DEFAULT_FORM_CONFIG: ContactFormConfig = {
  main: ["new", "refactor"],
  options: {
    new: ["house", "commerce", "other"],
    refactor: ["kitchen", "bathroom", "room", "outdoors", "other"],
  },
};

export default async function ContactPage() {
  const [socials, location, photo, formConfig] = await Promise.all([
    getSiteContent<ContactSocial[]>("contact_socials"),
    getSiteContent<ContactLocation>("contact_location"),
    getSiteContent<ContactPhoto>("contact_photo"),
    getSiteContent<ContactFormConfig>("contact_form"),
  ]);

  return (
    <ContactView
      socials={socials ?? []}
      location={location}
      photo={photo}
      formConfig={formConfig ?? DEFAULT_FORM_CONFIG}
    />
  );
}
