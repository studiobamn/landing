// =========================================================
// Typed data-fetch functions, one per view's needs.
// Called from Server Components only (see app/*/page.tsx).
// All functions degrade gracefully to empty/null when Supabase is
// unconfigured, so the site renders before the DB is wired up.
// =========================================================

import { BoardSnapshot } from "./board-storage";
import { supabase } from "./supabase";
import type {
  Project,
  ProjectImage,
  ProjectSection,
  ProjectWithImages,
  Product,
  ProductVariant,
  ProductWithVariants,
  ProductsByVolume,
  TeamMember,
  TeamRotationFrame,
  TeamAsset,
  TeamMemberFull,
  SiteContent,
} from "@/types";

export async function getProjects(): Promise<ProjectWithImages[]> {
  if (!supabase) return [];
  const { data: projects, error } = await supabase
    .from("projects")
    .select("*")
    .eq("published", true)
    .order("sort_order", { ascending: true });
  if (error) {
    console.error("getProjects:", error.message);
    return [];
  }

  const [{ data: images }, { data: sections }] = await Promise.all([
    supabase.from("project_images").select("*").order("sort_order", { ascending: true }),
    supabase.from("project_sections").select("*").order("sort_order", { ascending: true }),
  ]);

  const byProject = new Map<string, ProjectImage[]>();
  for (const img of (images as ProjectImage[]) ?? []) {
    const list = byProject.get(img.project_id) ?? [];
    list.push(img);
    byProject.set(img.project_id, list);
  }

  const sectionsByProject = new Map<string, ProjectSection[]>();
  for (const s of (sections as ProjectSection[]) ?? []) {
    const list = sectionsByProject.get(s.project_id) ?? [];
    list.push(s);
    sectionsByProject.set(s.project_id, list);
  }

  return ((projects as Project[]) ?? []).map((p) => ({
    ...p,
    images: byProject.get(p.id) ?? [],
    sections: sectionsByProject.get(p.id) ?? [],
  }));
}

export async function getProducts(): Promise<ProductsByVolume[]> {
  if (!supabase) return [];
  const { data: products, error } = await supabase
    .from("products")
    .select("*")
    .eq("published", true)
    .order("sort_order", { ascending: true });
  if (error) {
    console.error("getProducts:", error.message);
    return [];
  }

  const { data: variants } = await supabase
    .from("product_variants")
    .select("*")
    .order("sort_order", { ascending: true });

  const byProduct = new Map<string, ProductVariant[]>();
  for (const v of (variants as ProductVariant[]) ?? []) {
    const list = byProduct.get(v.product_id) ?? [];
    list.push(v);
    byProduct.set(v.product_id, list);
  }

  const flat: ProductWithVariants[] = ((products as Product[]) ?? []).map((p) => ({
    ...p,
    variants: byProduct.get(p.id) ?? [],
  }));

  // Group by volume, preserving sort_order across products
  const grouped = new Map<string, ProductWithVariants[]>();
  for (const p of flat) {
    const key = p.volume ?? "";
    const list = grouped.get(key) ?? [];
    list.push(p);
    grouped.set(key, list);
  }

  const volNum = (vol: string) =>
    parseInt(vol.match(/Vol\.\s*(\d+)/)?.[1] ?? "0", 10);

  return Array.from(grouped.entries())
    .sort(([a], [b]) => volNum(b) - volNum(a))
    .map(([vol, prods]) => ({ vol, products: prods }));
}

export async function getTeam(): Promise<TeamMemberFull[]> {
  if (!supabase) return [];
  const { data: members, error } = await supabase
    .from("team_members")
    .select("*")
    .eq("published", true)
    .order("sort_order", { ascending: true });
  if (error) {
    console.error("getTeam:", error.message);
    return [];
  }

  const { data: frames } = await supabase
    .from("team_rotation_frames")
    .select("*")
    .order("frame_index", { ascending: true });
  const { data: assets } = await supabase.from("team_assets").select("*");

  const framesByMember = new Map<string, TeamRotationFrame[]>();
  for (const f of (frames as TeamRotationFrame[]) ?? []) {
    const list = framesByMember.get(f.member_id) ?? [];
    list.push(f);
    framesByMember.set(f.member_id, list);
  }
  const assetsByMember = new Map<string, TeamAsset[]>();
  for (const a of (assets as TeamAsset[]) ?? []) {
    const list = assetsByMember.get(a.member_id) ?? [];
    list.push(a);
    assetsByMember.set(a.member_id, list);
  }

  return ((members as TeamMember[]) ?? []).map((m) => ({
    ...m,
    frames: framesByMember.get(m.id) ?? [],
    assets: assetsByMember.get(m.id) ?? [],
  }));
}

/** Fetch a single editable copy blob (home poem, manifesto, contact, ...). */
export async function getSiteContent<T = unknown>(
  key: string,
): Promise<T | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("site_content")
    .select("value")
    .eq("key", key)
    .maybeSingle();

  if (error) {
    console.error(`getSiteContent(${key}):`, error.message);
    return null;
  }
  return ((data as SiteContent | null)?.value as T) ?? null;
}

/**
 * Fetch all site_content rows whose key starts with `prefix`, returned as an
 * object keyed by the remainder (prefix stripped). e.g. prefix "about-" →
 * { headline_image, place_list, ... }. Returns null when nothing matches.
 */
export async function getSiteContentByPrefix<T = Record<string, unknown>>(
  prefix: string,
): Promise<T | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("site_content")
    .select("key, value")
    .like("key", `${prefix}%`);
  if (error) {
    console.error(`getSiteContentByPrefix(${prefix}):`, error.message);
    return null;
  }
  const rows = (data as SiteContent[] | null) ?? [];
  if (rows.length === 0) return null;
  const out: Record<string, unknown> = {};
  for (const row of rows) out[row.key.slice(prefix.length)] = row.value;
  return out as T;
}

/**
 * Fetch all site_content rows whose key starts with `prefix`, returned as an
 * object keyed by the remainder (prefix stripped). e.g. prefix "about-" →
 * { headline_image, place_list, ... }. Returns null when nothing matches.
 */
export async function getBoard<T = Record<string, unknown>>(
  col: "data" | "restore_point",
): Promise<T | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("board")
    .select("data, restore_point")
    .eq("name", "live")
    .single();
  if (error) {
    console.error(`ERROR - getBoard():`, error.message);
    return null;
  }
  const row = data[col] ?? null;
  return row as T | null;
}
/**
 * Fetch all site_content rows whose key starts with `prefix`, returned as an
 * object keyed by the remainder (prefix stripped). e.g. prefix "about-" →
 * { headline_image, place_list, ... }. Returns null when nothing matches.
 */
export async function saveBoard(
  snapshot: BoardSnapshot,
  col: "data" | "restore_point",
): Promise<BoardSnapshot | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("board")
    .update({ [col]: snapshot }) // newBoardData is a plain JS object/array
    .eq("name", "live");
  if (error) {
    console.error(`ERROR - saveBoard():`, error.message);
    return null;
  }
  return snapshot;
}
/**
 * Fetch all site_content rows whose key starts with `prefix`, returned as an
 * object keyed by the remainder (prefix stripped). e.g. prefix "about-" →
 * { headline_image, place_list, ... }. Returns null when nothing matches.
 */
export async function restoreBoard(): Promise<BoardSnapshot | null> {
  try {
    const d = await getBoard<BoardSnapshot>("restore_point");
    if (!d) {
      console.error(`ERROR - restoreBoard():`);
      return null;
    }
    await saveBoard(d, "data");
    return d;
  } catch (e) {
    console.error("ERROR - restoreBoard():", e);
    return null;
  }
}
