// =========================================================
// BAMN — shared TypeScript types
// Mirror the starter schema in /supabase/schema.sql.
// Schema is mutable; keep these in sync as columns change.
// Media fields hold Google Drive FILE IDs, not URLs (see lib/drive.ts).
// =========================================================

export interface Project {
  id: string;
  number: string | null;
  slug: string | null;
  title: string;
  year: string | null;
  category: string | null;
  location: string | null;
  cover_drive_id: string | null;
  tags: string[] | null;
  sort_order: number;
  published: boolean;
  created_at: string;
  // --- inspect-detail fields ---
  strip_words: string[] | null; // single-word strip
  plain_h_id: string | null; // horizontal image (URL / Drive id)
  plain_v_id: string | null; // vertical image
  info_img_lg: string | null; // vertical image (large)
  info_img_sm: string | null; // vertical image (small)
  credits: Record<string, string> | null; // { "Name": "Job title" }
  phrases: string[] | null; // kept: provides phrase count for ProjectPhrases
}

export interface ProjectImage {
  id: string;
  project_id: string;
  drive_id: string;
  sort_order: number;
  width: number | null;
  height: number | null;
}

export interface ProjectWithImages extends Project {
  images: ProjectImage[];
}

export interface Product {
  id: string;
  volume: string | null;
  name: string;
  dimensions: string | null;
  sort_order: number;
  published: boolean;
  created_at: string;
}

/** Optional per-variant display dimensions (jsonb). */
export interface VariantExtras {
  width?: string;
  height?: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  label: string | null;
  drive_id: string;
  sort_order: number;
  extras: VariantExtras | null;
}

export interface ProductWithVariants extends Product {
  variants: ProductVariant[];
}

/** Current product line label, stored in site_content under 'product_line'. */
export interface ProductLine {
  volume: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string | null;
  note: string | null;
  name_drive_id: string | null;
  sort_order: number;
  published: boolean;
  created_at: string;
}

export interface TeamRotationFrame {
  id: string;
  member_id: string;
  drive_id: string;
  frame_index: number;
}

export interface TeamAsset {
  id: string;
  member_id: string;
  type: string | null; // 'sketch' | 'tag' | 'swatch' ...
  drive_id: string;
  pos_x: string | null; // e.g. "12%"
  pos_y: string | null; // e.g. "20%"
  depth: "front" | "back" | string;
}

export interface TeamMemberFull extends TeamMember {
  frames: TeamRotationFrame[];
  assets: TeamAsset[];
}

export interface SiteContent {
  key: string; // 'home_poem' | 'about_manifesto' | 'contact' ...
  value: unknown; // flexible jsonb blob
}

export interface HomePoem {
  data: string;
}

// --- About view (stored in site_content under the 'about' key) ---
export interface AboutPlaceItem {
  text: string;
  textEs: string;
  weight: "bold" | "normal";
  case: "upper" | "mixed";
}
export interface AboutKeyword {
  text: string;
  textEs: string;
  weight: "bold" | "normal";
}
export interface AboutContent {
  headline_image: string;
  vertical_label_line1: string;
  image_a: string;
  image_b: string;
  place_list: AboutPlaceItem[];
  keywords: AboutKeyword[];
  scrawl_images: string[];
}

// --- Contact view (stored in site_content as separate keys) ---
export interface ContactSocial {
  label: string;
  url: string;
}
export interface ContactLocation {
  city: string;
  phone?: string;
  email?: string;
  address?: string[];
}
export interface ContactPhoto {
  src: string; // Drive file ID or absolute URL
  caption?: string; // kept as EN fallback; translation in db.siteContent.contactPhotoCaption
}
export interface ContactInquiry {
  label: string;
  text: string; // kept as EN fallback; translation in db.siteContent.contactInquiry{i}*
}
export interface ContactInquiries {
  heading?: string;
  items: ContactInquiry[];
}

/**
 * Home cover images per nav view. Each value is a Google Drive file ID or an
 * absolute URL (see lib/drive.ts → resolveMediaUrl). Stored in site_content
 * under the 'home_covers' key.
 */
export interface HomeCovers {
  projects?: string;
  product?: string;
  about?: string;
  contact?: string;
  board?: string;
}
