-- =========================================================
-- BAMN — dummy data to render the Home view.
-- Run in the Supabase SQL editor (after schema.sql + its RLS policies).
-- Safe to re-run: both rows upsert on their key.
--
-- The Home view reads two site_content keys:
--   home_poem   → { "data": "<text>" }   (Layer 1 background poem)
--   home_covers → { "<view>": "<media>" } for projects/product/about/contact
--
-- Cover values may be a Google Drive FILE ID or an absolute URL. The
-- placeholders below use picsum.photos so Home renders before real assets
-- exist — swap each value for a Drive file ID when the studio provides art.
-- =========================================================

insert into site_content (key, value)
values (
  'home_poem',
  '{"data": "we build as if\nthe ground were never\npromised to us"}'::jsonb
)
on conflict (key) do update set value = excluded.value;

insert into site_content (key, value)
values (
  'home_covers',
  '{
     "projects": "https://picsum.photos/seed/bamn-projects/400/560",
     "product":  "https://picsum.photos/seed/bamn-product/600/420",
     "about":    "https://picsum.photos/seed/bamn-about/480/480",
     "contact":  "https://picsum.photos/seed/bamn-contact/380/520",
     "board":    "https://picsum.photos/seed/bamn-board/600/420"
   }'::jsonb
)
on conflict (key) do update set value = excluded.value;

-- =========================================================
-- PROJECTS view
-- Resting-state quote (left column).
-- =========================================================
insert into site_content (key, value)
values (
  'projects_quote',
  '{"data": "We do not decorate the world.\nWe take a position in it."}'::jsonb
)
on conflict (key) do update set value = excluded.value;

-- 11 dummy projects. cover_drive_id holds a picsum URL (resolveMediaUrl passes
-- absolute URLs through unchanged) — swap for Drive file IDs with real art.
-- Re-runnable: upserts on the unique slug.
insert into projects
  (number, slug, title, year, category, location, description, cover_drive_id, tags, sort_order, published)
values
  ('01', 'casa-talud',        'Casa Talud',        '2024', 'Residential', 'Caracas, Venezuela',
   'A house cut into a hillside, where the retaining wall becomes the principal living surface and the roof returns the slope to the garden.',
   'https://picsum.photos/seed/bamn-p01/1200/800', '{concrete,hillside,private residence}', 1, true),
  ('02', 'mercado-cubierto',  'Mercado Cubierto',  '2023', 'Public', 'Maracaibo, Venezuela',
   'A market hall under a single folded canopy that shades without enclosing, keeping the street air moving through the stalls.',
   'https://picsum.photos/seed/bamn-p02/1200/800', '{steel,canopy,public space}', 2, true),
  ('03', 'taller-norte',      'Taller Norte',      '2023', 'Industrial', 'Valencia, Venezuela',
   'A workshop and small foundry organized around a top-lit central bay, with services pushed to a heavy perimeter wall.',
   'https://picsum.photos/seed/bamn-p03/1200/800', '{brick,industrial,daylight}', 3, true),
  ('04', 'pabellon-agua',     'Pabellón de Agua',  '2022', 'Cultural', 'Mérida, Venezuela',
   'A small exhibition pavilion sited over a reflecting basin, its galleries reached by a sequence of low ramps.',
   'https://picsum.photos/seed/bamn-p04/1200/800', '{water,pavilion,ramp}', 4, true),
  ('05', 'edificio-cobre',    'Edificio Cobre',    '2022', 'Commercial', 'Caracas, Venezuela',
   'A mixed-use block clad in oxidizing copper, where the patina records the building''s exposure to the city over time.',
   'https://picsum.photos/seed/bamn-p05/1200/800', '{copper,mixed-use,facade}', 5, true),
  ('06', 'biblioteca-piedra', 'Biblioteca de Piedra', '2021', 'Civic', 'Barquisimeto, Venezuela',
   'A neighborhood library built from local stone, with reading rooms that step down toward a shaded courtyard.',
   'https://picsum.photos/seed/bamn-p06/1200/800', '{stone,library,courtyard}', 6, true),
  ('07', 'casa-patio',        'Casa Patio',        '2021', 'Residential', 'Margarita, Venezuela',
   'A coastal house turned inward around a planted patio, trading the view for cross-ventilation and privacy.',
   'https://picsum.photos/seed/bamn-p07/1200/800', '{patio,coastal,minimal}', 7, true),
  ('08', 'nave-sur',          'Nave Sur',          '2020', 'Industrial', 'Puerto Ordaz, Venezuela',
   'A long-span logistics shed whose structure is left exposed as the only architecture, lit by continuous clerestories.',
   'https://picsum.photos/seed/bamn-p08/1200/800', '{long-span,structure,warehouse}', 8, true),
  ('09', 'capilla-luz',       'Capilla de Luz',    '2020', 'Religious', 'Los Andes, Venezuela',
   'A chapel where a single oculus tracks the day across a bare concrete shell, the only ornament being the moving light.',
   'https://picsum.photos/seed/bamn-p09/1200/800', '{concrete,light,chapel}', 9, true),
  ('10', 'oficinas-trama',    'Oficinas Trama',    '2019', 'Interior', 'Caracas, Venezuela',
   'An office interior built as a loose timber lattice, dividing space without sealing it, so light and sound carry through.',
   'https://picsum.photos/seed/bamn-p10/1200/800', '{timber,interior,lattice}', 10, true),
  ('11', 'puente-mirador',    'Puente Mirador',    '2019', 'Infrastructure', 'Mérida, Venezuela',
   'A pedestrian bridge that widens at midspan into a small belvedere, giving the crossing a reason to pause.',
   'https://picsum.photos/seed/bamn-p11/1200/800', '{bridge,steel,landscape}', 11, true)
on conflict (slug) do update set
  number = excluded.number,
  title = excluded.title,
  year = excluded.year,
  category = excluded.category,
  location = excluded.location,
  description = excluded.description,
  cover_drive_id = excluded.cover_drive_id,
  tags = excluded.tags,
  sort_order = excluded.sort_order,
  published = excluded.published;

-- =========================================================
-- PRODUCT view
-- Current line label (header "Vol. 01 / line name" + optional subtitle).
-- =========================================================
insert into site_content (key, value)
values (
  'product_line',
  '{"volume": "Vol. 01", "lineName": "Objects in Steel", "subtitle": "Objects by BAMN"}'::jsonb
)
on conflict (key) do update set value = excluded.value;

-- Per-variant display dimensions. Nullable jsonb, shape: {"width","height"}.
alter table product_variants add column if not exists extras jsonb;

-- 2 dummy products with variants (chair: 3, rug: 2). Variant drive_id holds a
-- picsum URL (resolveMediaUrl passes absolute URLs through). The card image is
-- the first variant. `extras` gives each variant its own width/height (used by
-- ProductCard for the image aspect ratio). Re-runnable: removes the two by
-- name, then re-inserts.
delete from product_variants
  where product_id in (select id from products where name in ('Bend Chair', 'Loop Rug'));
delete from products where name in ('Bend Chair', 'Loop Rug');

with chair as (
  insert into products
    (volume, line_name, name, description, materials, dimensions, sort_order, published)
  values
    ('Vol. 01', 'Objects in Steel', 'Bend Chair',
     'A single length of tube bent into a seat — one continuous gesture, no joints to hide.',
     'Powder-coated steel', 'H 80 × W 45 × D 50 cm', 1, true)
  returning id
)
insert into product_variants (product_id, label, drive_id, sort_order, extras)
select chair.id, v.label, v.drive_id, v.sort_order, v.extras::jsonb
from chair,
  (values
    ('Black', 'https://picsum.photos/seed/bamn-chair-black/900/1100', 0, '{"width": "200", "height": "350"}'),
    ('Red',   'https://picsum.photos/seed/bamn-chair-red/900/1100',   1, '{"width": "260", "height": "320"}'),
    ('Raw',   'https://picsum.photos/seed/bamn-chair-raw/900/1100',   2, '{"width": "220", "height": "380"}')
  ) as v(label, drive_id, sort_order, extras);

with rug as (
  insert into products
    (volume, line_name, name, description, materials, dimensions, sort_order, published)
  values
    ('Vol. 01', 'Objects in Steel', 'Loop Rug',
     'A hand-tufted wool rug whose pattern is a single looping line, drawn once and never lifted.',
     'Hand-tufted wool', '240 × 170 cm', 2, true)
  returning id
)
insert into product_variants (product_id, label, drive_id, sort_order, extras)
select rug.id, v.label, v.drive_id, v.sort_order, v.extras::jsonb
from rug,
  (values
    ('Stone', 'https://picsum.photos/seed/bamn-rug-stone/900/1100', 0, '{"width": "360", "height": "240"}'),
    ('Rust',  'https://picsum.photos/seed/bamn-rug-rust/900/1100',  1, '{"width": "320", "height": "260"}')
  ) as v(label, drive_id, sort_order, extras);

-- =========================================================
-- CONTACT view — four separate site_content rows.
-- photo.src is a Drive file ID or absolute URL (resolveMediaUrl passes URLs
-- through). picsum ?grayscale gives a black-and-white placeholder.
-- =========================================================
insert into site_content (key, value)
values (
  'contact_socials',
  '[
     {"label": "Instagram", "url": "https://instagram.com/studio.bamn"},
     {"label": "Behance",   "url": "https://behance.net/studiobamn"},
     {"label": "LinkedIn",  "url": "https://linkedin.com/company/studiobamn"}
   ]'::jsonb
)
on conflict (key) do update set value = excluded.value;

insert into site_content (key, value)
values (
  'contact_location',
  '{
     "city": "Caracas",
     "phone": "+58 212 000 0000",
     "email": "studio@bamn.studio",
     "address": ["Av. Principal, Edif. Talud", "Caracas 1060", "Venezuela"]
   }'::jsonb
)
on conflict (key) do update set value = excluded.value;

insert into site_content (key, value)
values (
  'contact_photo',
  '{
     "src": "https://picsum.photos/seed/bamn-principals/1000/1200?grayscale",
     "caption": "The studio — Caracas"
   }'::jsonb
)
on conflict (key) do update set value = excluded.value;

insert into site_content (key, value)
values (
  'contact_inquiries',
  '{
     "heading": "Social",
     "items": [
       {"label": "New Business/",     "text": "Please direct new project enquiries to studio@bamn.studio."},
       {"label": "Job Applications/", "text": "Send your portfolio to jobs@bamn.studio. Max 10MB, PDF only."},
       {"label": "Portfolios/",       "text": "Accepted as PDF only. Max 10MB."}
     ]
   }'::jsonb
)
on conflict (key) do update set value = excluded.value;

-- =========================================================
-- BOARD view — collaborative graffiti wall (instructions/BOARD.md).
-- Singleton row (name = 'live'). Public read + update (graffiti wall);
-- destructive ops (commit/wipe/nuke) are gated server-side, NOT by RLS.
-- =========================================================
create table if not exists board (
  name          text primary key default 'live', -- singleton; always "live"
  data          jsonb,                            -- live working snapshot (everyone writes)
  restore_point jsonb,                            -- committed checkpoint (admin commit only)
  updated_at    timestamptz default now()
);

-- ensure the single row exists
insert into board (name, data, restore_point)
values ('live', null, null)
on conflict (name) do nothing;

-- RLS: anyone reads, anyone updates `data` (public wall). No delete policy =
-- delete denied. Commit/wipe/nuke are protected in the route handlers.
alter table board enable row level security;

drop policy if exists "board_public_read" on board;
create policy "board_public_read" on board for select using (true);

drop policy if exists "board_public_update" on board;
create policy "board_public_update" on board for update using (true) with check (true);

-- =========================================================
-- ABOUT view — one row per attribute, keyed "about-<field>".
-- The page reassembles every 'about-%' row into the AboutContent object (each
-- key, minus the "about-" prefix, maps to a field). Each value is jsonb: scalar
-- strings are quoted ('"x"'::jsonb), lists are arrays. headline_image +
-- scrawl_images are local /public PNGs (resolveMediaUrl passes paths through);
-- image_a/image_b are Drive file IDs or URLs (picsum ?grayscale here).
-- =========================================================
delete from site_content where key = 'about'; -- drop the old single blob

insert into site_content (key, value)
values
  ('about-headline_image', '"/img/about-headline.png"'::jsonb),
  ('about-vertical_label_line1', '"BAMN"'::jsonb),
  ('about-vertical_label_line2', '"STUDIO COLLECTION"'::jsonb),
  ('about-image_a', '"https://picsum.photos/seed/bamn-about-a/640/853?grayscale"'::jsonb),
  ('about-image_b', '"https://picsum.photos/seed/bamn-about-b/640/853?grayscale"'::jsonb),
  ('about-place_list', '[
     {"text": "CARACAS",     "weight": "bold",   "case": "upper"},
     {"text": "Venezuela",   "weight": "normal", "case": "mixed"},
     {"text": "RESIDENTIAL", "weight": "bold",   "case": "upper"},
     {"text": "Commercial",  "weight": "normal", "case": "mixed"},
     {"text": "OBJECTS",     "weight": "bold",   "case": "upper"}
   ]'::jsonb),
  ('about-manifesto', '"We use the beauty of chaos and give it form. Every project begins with the willingness to not know the answer yet — to build as if the ground were never promised to us."'::jsonb),
  ('about-keywords', '[
     {"text": "CHAOS",     "weight": "bold"},
     {"text": "FORM",      "weight": "normal"},
     {"text": "CURIOSITY", "weight": "bold"},
     {"text": "PRECISION", "weight": "normal"}
   ]'::jsonb),
  ('about-footer_meta_line1', '"EST. 2020  ·  MARCH"'::jsonb),
  ('about-footer_meta_line2', '"CARACAS  ·  BY APPOINTMENT"'::jsonb),
  ('about-scrawl_images', '["/img/about-stroke-1.png", "/img/about-stroke-2.png"]'::jsonb)
on conflict (key) do update set value = excluded.value;

-- =========================================================
-- PROJECT IMAGES — gallery images per project (2–6 each), for the Projects
-- inspect gallery. Adds width/height columns (random per image; the picsum URL
-- uses the same dims so the ratio matches). Joins by slug to the live project
-- ids. Re-runnable: clears project_images first.
-- =========================================================
alter table project_images add column if not exists width int;
alter table project_images add column if not exists height int;

delete from project_images;

insert into project_images (project_id, drive_id, sort_order, width, height)
select
  pj.id,
  'https://picsum.photos/seed/' || pj.slug || '-' || g.n || '/' || dim.w || '/' || dim.h,
  g.n,
  dim.w,
  dim.h
from (values
  ('casa-talud', 6),
  ('mercado-cubierto', 4),
  ('taller-norte', 3),
  ('pabellon-agua', 5),
  ('edificio-cobre', 2),
  ('biblioteca-piedra', 4),
  ('casa-patio', 3),
  ('nave-sur', 6),
  ('capilla-luz', 2),
  ('oficinas-trama', 5),
  ('puente-mirador', 4)
) as cfg(slug, cnt)
join projects pj on pj.slug = cfg.slug
cross join lateral generate_series(0, cfg.cnt - 1) as g(n)
cross join lateral (
  select
    (array[1200, 1000, 900, 1400, 800, 1100])[1 + floor(random() * 6)::int] as w,
    (array[200, 200, 200, 200, 200, 1000])[1 + floor(random() * 6)::int] as h
) as dim;

-- =========================================================
-- PROJECTS — extra inspect-detail columns (added later).
--   strip_words       jsonb  string[] of single words
--   description_short  text
--   plain_h_id         text   horizontal image URL / Drive id
--   plain_v_id         text   vertical image URL / Drive id
--   info_img_lg        text   vertical image URL / Drive id (large)
--   info_img_sm        text   vertical image URL / Drive id (small)
--   credits            jsonb  { "Name": "Job title" }
--   phrases            jsonb  string[]
-- Image URLs use picsum seeded per slug; -ph is landscape, -pv/-il/-is portrait.
-- =========================================================
alter table projects add column if not exists strip_words      jsonb;
alter table projects add column if not exists description_short text;
alter table projects add column if not exists plain_h_id        text;
alter table projects add column if not exists plain_v_id        text;
alter table projects add column if not exists info_img_lg       text;
alter table projects add column if not exists info_img_sm       text;
alter table projects add column if not exists credits           jsonb;
alter table projects add column if not exists phrases           jsonb;

update projects p set
  strip_words       = v.strip_words::jsonb,
  description_short  = v.description_short,
  plain_h_id         = 'https://picsum.photos/seed/' || p.slug || '-ph/1200/700',
  plain_v_id         = 'https://picsum.photos/seed/' || p.slug || '-pv/700/1100',
  info_img_lg        = 'https://picsum.photos/seed/' || p.slug || '-il/800/1200',
  info_img_sm        = 'https://picsum.photos/seed/' || p.slug || '-is/600/900',
  credits            = v.credits::jsonb,
  phrases            = v.phrases::jsonb
from (values
  ('casa-talud',        '["concrete","hillside","home"]',  'A house cut into the hillside.',
     '{"Arantxa Bruno":"Architect","Luis Rangel":"Structure"}',   '["The wall becomes the house.","Ground as material."]'),
  ('mercado-cubierto',  '["steel","canopy","market"]',     'One folded canopy over the stalls.',
     '{"Arantxa Bruno":"Architect","Sofía León":"Project Lead"}', '["Shade without enclosure.","The air keeps moving."]'),
  ('taller-norte',      '["brick","foundry","light"]',     'A workshop around a top-lit bay.',
     '{"Arantxa Bruno":"Architect","Marco Díaz":"Site"}',         '["Work needs north light.","Mass at the edges."]'),
  ('pabellon-agua',     '["water","pavilion","ramp"]',     'A pavilion over a reflecting basin.',
     '{"Arantxa Bruno":"Architect","Sofía León":"Curation"}',     '["Arrive by water.","Low ramps, slow rooms."]'),
  ('edificio-cobre',    '["copper","facade","time"]',      'A block clad in oxidizing copper.',
     '{"Arantxa Bruno":"Architect","Luis Rangel":"Facade"}',      '["The patina keeps time.","The city writes the surface."]'),
  ('biblioteca-piedra', '["stone","library","courtyard"]', 'A library of local stone.',
     '{"Arantxa Bruno":"Architect","Sofía León":"Program"}',      '["Read toward the shade.","Stone holds the cool."]'),
  ('casa-patio',        '["patio","coastal","privacy"]',   'A coastal house turned inward.',
     '{"Arantxa Bruno":"Architect","Marco Díaz":"Build"}',        '["Trade the view for air.","The patio is the room."]'),
  ('nave-sur',          '["structure","span","light"]',    'A shed where structure is the architecture.',
     '{"Arantxa Bruno":"Architect","Luis Rangel":"Structure"}',   '["Leave the frame exposed.","Light from the ridge."]'),
  ('capilla-luz',       '["concrete","light","oculus"]',   'A chapel tracked by a single oculus.',
     '{"Arantxa Bruno":"Architect","Sofía León":"Liturgy"}',      '["Light is the only ornament.","The day moves the room."]'),
  ('oficinas-trama',    '["timber","lattice","open"]',     'An office built as a timber lattice.',
     '{"Arantxa Bruno":"Architect","Marco Díaz":"Interior"}',     '["Divide without sealing.","Let sound carry."]'),
  ('puente-mirador',    '["bridge","steel","pause"]',      'A bridge that widens into a belvedere.',
     '{"Arantxa Bruno":"Architect","Luis Rangel":"Engineering"}', '["A reason to pause.","Cross, and look."]')
) as v(slug, strip_words, description_short, credits, phrases)
where p.slug = v.slug;
