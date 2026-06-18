// =========================================================
// Contact view — the quietest view (see instructions/CONTACT.md). Static; the
// only motion is the calm, unhurried entry/exit. Header wording confirm w/ studio.
// =========================================================

export const CONTACT_HEADER = "CONTACT";

/** Enter timing (seconds) — position on the timeline + duration. */
export const ENTER = {
  headerAt: 0,
  header: 0.5,
  socialAt: 0.25,
  social: 0.35,
  dividerAt: 0.35,
  divider: 0.4,
  locationAt: 0.45,
  location: 0.45,
  photoAt: 0.5,
  photo: 0.6,
  inquiriesAt: 0.75,
  inquiry: 0.4,
  inquiryStagger: 0.1,
} as const;
