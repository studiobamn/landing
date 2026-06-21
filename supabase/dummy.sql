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

-- =========================================================
-- PROJECT SECTIONS — 2-3 rich content blocks per project.
-- img_position cycles through the four layout variants so
-- every position is represented across the dataset.
-- Re-runnable: truncates project_sections first.
-- =========================================================
truncate table project_sections restart identity cascade;

insert into project_sections (project_id, text, img, img_position, sort_order) values

-- 01 casa-talud (b9b1ad42)
('b9b1ad42-d255-4625-9ef9-1dd7892b2fb9',
 'The retaining wall is poured in a single continuous pour, leaving the formwork texture as the finished interior surface.',
 'https://picsum.photos/seed/casa-talud-s1/1200/800', 'top', 0),
('b9b1ad42-d255-4625-9ef9-1dd7892b2fb9',
 'Roof garden returns the displaced ground back to the hillside, so the house leaves no visible footprint from above.',
 'https://picsum.photos/seed/casa-talud-s2/800/600', 'left', 1),
('b9b1ad42-d255-4625-9ef9-1dd7892b2fb9',
 null,
 'https://picsum.photos/seed/casa-talud-s3/1200/500', 'top', 2),

-- 02 mercado-cubierto (27bdeb44)
('27bdeb44-0b26-4071-8b2e-250832118c42',
 'The canopy folds twice — once to shed rain, once to direct the breeze toward the central aisle.',
 'https://picsum.photos/seed/mercado-cubierto-s1/900/600', 'right', 0),
('27bdeb44-0b26-4071-8b2e-250832118c42',
 null,
 'https://picsum.photos/seed/mercado-cubierto-s2/1200/700', 'top', 1),

-- 03 taller-norte (fa3c4990)
('fa3c4990-771d-4d98-8fca-11ec5f13e245',
 'North-facing clerestories keep the light diffuse and constant — critical for the precision work done at the benches below.',
 'https://picsum.photos/seed/taller-norte-s1/800/600', 'left', 0),
('fa3c4990-771d-4d98-8fca-11ec5f13e245',
 'The perimeter brick wall is 600 mm thick, absorbing summer heat during the day and releasing it through the night.',
 'https://picsum.photos/seed/taller-norte-s2/800/600', 'right', 1),
('fa3c4990-771d-4d98-8fca-11ec5f13e245',
 null,
 'https://picsum.photos/seed/taller-norte-s3/1200/500', 'top', 2),

-- 04 pabellon-agua (24e13e4e)
('24e13e4e-c008-4b02-824d-cc5e55ecab46',
 'The reflecting basin is shallow enough to walk across when drained for maintenance, and deep enough to mirror the sky in full.',
 'https://picsum.photos/seed/pabellon-agua-s1/1200/800', 'top', 0),
('24e13e4e-c008-4b02-824d-cc5e55ecab46',
 'Ramps descend at a 1:20 gradient — slow enough to feel like a promenade, not an access route.',
 'https://picsum.photos/seed/pabellon-agua-s2/800/600', 'left', 1),

-- 05 edificio-cobre (7f9f1eba)
('7f9f1eba-5514-4781-a7d3-7de6db60877b',
 'Copper panels are pre-oxidized in three stages so the facade reads as a single weathered surface on day one.',
 'https://picsum.photos/seed/edificio-cobre-s1/800/600', 'right', 0),
('7f9f1eba-5514-4781-a7d3-7de6db60877b',
 null,
 'https://picsum.photos/seed/edificio-cobre-s2/1200/700', 'top', 1),
('7f9f1eba-5514-4781-a7d3-7de6db60877b',
 'Ground-floor commercial units are set back 1.5 m behind an arcade, keeping the pavement in shade year-round.',
 'https://picsum.photos/seed/edificio-cobre-s3/800/600', 'left', 2),

-- 06 biblioteca-piedra (90e05004)
('90e05004-cc5b-4574-bca3-db9f768c5c38',
 'Stone was quarried 12 km from site and cut to three standard coursing heights, allowing the masons to vary texture without custom tooling.',
 'https://picsum.photos/seed/biblioteca-piedra-s1/800/600', 'left', 0),
('90e05004-cc5b-4574-bca3-db9f768c5c38',
 null,
 'https://picsum.photos/seed/biblioteca-piedra-s2/1200/600', 'top', 1),

-- 07 casa-patio (f45299bd)
('f45299bd-d12d-4283-b535-6f1041b063c6',
 'The patio is planted with a single species — a dense fig — chosen because its canopy closes in summer and opens in winter.',
 'https://picsum.photos/seed/casa-patio-s1/800/600', 'right', 0),
('f45299bd-d12d-4283-b535-6f1041b063c6',
 'All principal rooms open directly onto the patio; no room shares a wall with the exterior perimeter.',
 'https://picsum.photos/seed/casa-patio-s2/800/600', 'left', 1),
('f45299bd-d12d-4283-b535-6f1041b063c6',
 null,
 'https://picsum.photos/seed/casa-patio-s3/1200/500', 'bottom', 2),

-- 08 nave-sur (c0d78af9)
('c0d78af9-6f77-422e-b29b-d8cbe62c6732',
 'The primary trusses span 36 m without intermediate columns — the clear floor is the entire brief.',
 'https://picsum.photos/seed/nave-sur-s1/1200/700', 'top', 0),
('c0d78af9-6f77-422e-b29b-d8cbe62c6732',
 'Continuous ridge clerestories run the full 120 m length, giving even daylight to every point on the floor.',
 'https://picsum.photos/seed/nave-sur-s2/800/600', 'right', 1),

-- 09 capilla-luz (d1677cf1)
('d1677cf1-b993-47c1-b322-25765247398d',
 'The oculus is oriented so that at midday on the winter solstice, the light falls precisely on the altar slab.',
 'https://picsum.photos/seed/capilla-luz-s1/800/900', 'right', 0),
('d1677cf1-b993-47c1-b322-25765247398d',
 null,
 'https://picsum.photos/seed/capilla-luz-s2/1200/600', 'top', 1),
('d1677cf1-b993-47c1-b322-25765247398d',
 'The concrete shell is 180 mm thick — the minimum to carry the snow load from the Andean winter without visible buttressing.',
 'https://picsum.photos/seed/capilla-luz-s3/800/600', 'left', 2),

-- 10 oficinas-trama (36c0d654)
('36c0d654-d00d-4b32-afd2-172efb104c07',
 'The lattice is assembled from a single timber section — 40 × 90 mm — repeated at two angles to create the woven visual.',
 'https://picsum.photos/seed/oficinas-trama-s1/800/600', 'left', 0),
('36c0d654-d00d-4b32-afd2-172efb104c07',
 null,
 'https://picsum.photos/seed/oficinas-trama-s2/1200/600', 'top', 1),

-- 11 puente-mirador (12b81009)
('12b81009-4210-4e0b-895a-f666a965869a',
 'The widening at midspan is gradual — 2 m over 8 m — so pedestrians slow without noticing the geometry change.',
 'https://picsum.photos/seed/puente-mirador-s1/1200/700', 'top', 0),
('12b81009-4210-4e0b-895a-f666a965869a',
 'The belvedere floor is a steel grate: you see the river 40 m below through your feet.',
 'https://picsum.photos/seed/puente-mirador-s2/800/600', 'right', 1),
('12b81009-4210-4e0b-895a-f666a965869a',
 null,
 'https://picsum.photos/seed/puente-mirador-s3/1200/500', 'bottom', 2);

-- =========================================================
-- PRODUCTS REWRITE — delete Vol. 02, 03, 04 and re-insert
-- with description, materials, and sort_order reflecting
-- display order: Vol. 04 (1–3) → Vol. 03 (4–5) → Vol. 02 (6–10).
-- Vol. 01 is untouched.
-- =========================================================
delete from product_variants
  where product_id in (
    select id from products
    where volume like 'Vol. 02%'
       or volume like 'Vol. 03%'
       or volume like 'Vol. 04%'
  );
delete from products
  where volume like 'Vol. 02%'
     or volume like 'Vol. 03%'
     or volume like 'Vol. 04%';

-- ── Vol. 04 / Cast Forms — sort_order 1–3 ────────────────
with col_block as (
  insert into products (volume, name, description, materials, dimensions, sort_order, published, available)
  values (
    'Vol. 04 / Cast Forms', 'Column Block',
    'A solid cast column reduced to its essential geometry. Works as plinth, side table, or seat.',
    'Cast concrete',
    'H 90 × W 20 × D 20 cm', 1, true, true
  ) returning id
)
insert into product_variants (product_id, label, drive_id, sort_order, extras)
select col_block.id, v.label, v.drive_id, v.sort_order, v.extras::jsonb
from col_block,
  (values
    ('Natural', 'https://picsum.photos/seed/bamn-col-nat/700/1000', 0, '{"width": "210", "height": "300"}'),
    ('Charcoal','https://picsum.photos/seed/bamn-col-cha/700/1000', 1, '{"width": "210", "height": "300"}')
  ) as v(label, drive_id, sort_order, extras);

with threshold as (
  insert into products (volume, name, description, materials, dimensions, sort_order, published, available)
  values (
    'Vol. 04 / Cast Forms', 'Threshold Slab',
    'A single long casting that marks the boundary between spaces without interrupting the plane of the floor.',
    'Cast concrete, brushed finish',
    '240 × 40 × 5 cm', 2, true, false
  ) returning id
)
insert into product_variants (product_id, label, drive_id, sort_order, extras)
select threshold.id, v.label, v.drive_id, v.sort_order, v.extras::jsonb
from threshold,
  (values
    ('Raw', 'https://picsum.photos/seed/bamn-thresh-raw/900/300', 0, '{"width": "360", "height": "120"}')
  ) as v(label, drive_id, sort_order, extras);

with bench as (
  insert into products (volume, name, description, materials, dimensions, sort_order, published, available)
  values (
    'Vol. 04 / Cast Forms', 'Mass Bench',
    'A bench that communicates weight. Proportioned to function as seating, shelf, or pure object.',
    'Cast concrete',
    'H 45 × W 180 × D 40 cm', 3, true, true
  ) returning id
)
insert into product_variants (product_id, label, drive_id, sort_order, extras)
select bench.id, v.label, v.drive_id, v.sort_order, v.extras::jsonb
from bench,
  (values
    ('White', 'https://picsum.photos/seed/bamn-bench-wht/900/500', 0, '{"width": "360", "height": "200"}'),
    ('Black', 'https://picsum.photos/seed/bamn-bench-blk/900/500', 1, '{"width": "360", "height": "200"}')
  ) as v(label, drive_id, sort_order, extras);

-- ── Vol. 03 / Woven Work — sort_order 4–5 ────────────────
with cushion as (
  insert into products (volume, name, description, materials, dimensions, sort_order, published, available)
  values (
    'Vol. 03 / Woven Work', 'Grid Cushion',
    'Hand-tufted on a loom calibrated to the exact grid. Each piece is identical in structure; no two read the same in light.',
    'Hand-tufted wool, linen backing',
    '50 × 50 cm', 4, true, true
  ) returning id
)
insert into product_variants (product_id, label, drive_id, sort_order, extras)
select cushion.id, v.label, v.drive_id, v.sort_order, v.extras::jsonb
from cushion,
  (values
    ('Stone', 'https://picsum.photos/seed/bamn-cush-sto/800/800', 0, '{"width": "240", "height": "240"}'),
    ('Rust',  'https://picsum.photos/seed/bamn-cush-rst/800/800', 1, '{"width": "240", "height": "240"}'),
    ('Olive', 'https://picsum.photos/seed/bamn-cush-olv/800/800', 2, '{"width": "240", "height": "240"}')
  ) as v(label, drive_id, sort_order, extras);

with throw as (
  insert into products (volume, name, description, materials, dimensions, sort_order, published, available)
  values (
    'Vol. 03 / Woven Work', 'Weave Throw',
    'A single long weave — the thread never crosses itself. Draped or folded, the pattern holds.',
    'Hand-woven merino wool',
    '180 × 130 cm', 5, true, false
  ) returning id
)
insert into product_variants (product_id, label, drive_id, sort_order, extras)
select throw.id, v.label, v.drive_id, v.sort_order, v.extras::jsonb
from throw,
  (values
    ('Ecru', 'https://picsum.photos/seed/bamn-throw-ecru/900/700', 0, '{"width": "360", "height": "280"}')
  ) as v(label, drive_id, sort_order, extras);

-- ── Vol. 02 / Steel Objects — sort_order 6–10 ────────────
with chair as (
  insert into products (volume, name, description, materials, dimensions, sort_order, published, available)
  values (
    'Vol. 02 / Steel Objects', 'Bend Chair',
    'A single length of tube bent into a seat — one continuous gesture, no joints to hide.',
    'Powder-coated steel',
    'H 80 × W 45 × D 50 cm', 6, true, true
  ) returning id
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
  insert into products (volume, name, description, materials, dimensions, sort_order, published, available)
  values (
    'Vol. 02 / Steel Objects', 'Loop Rug',
    'A hand-tufted rug whose pattern is a single looping line, drawn once and never lifted.',
    'Hand-tufted wool',
    '240 × 170 cm', 7, true, true
  ) returning id
)
insert into product_variants (product_id, label, drive_id, sort_order, extras)
select rug.id, v.label, v.drive_id, v.sort_order, v.extras::jsonb
from rug,
  (values
    ('Stone', 'https://picsum.photos/seed/bamn-rug-stone/900/1100', 0, '{"width": "360", "height": "240"}'),
    ('Rust',  'https://picsum.photos/seed/bamn-rug-rust/900/1100',  1, '{"width": "320", "height": "260"}')
  ) as v(label, drive_id, sort_order, extras);

with arc as (
  insert into products (volume, name, description, materials, dimensions, sort_order, published, available)
  values (
    'Vol. 02 / Steel Objects', 'Arc Table',
    'A table whose legs are a single arc in steel. The top rests as if placed, not fixed.',
    'Powder-coated steel, glass top',
    'H 72 × W 120 × D 60 cm', 8, true, true
  ) returning id
)
insert into product_variants (product_id, label, drive_id, sort_order, extras)
select arc.id, v.label, v.drive_id, v.sort_order, v.extras::jsonb
from arc,
  (values
    ('Black',  'https://picsum.photos/seed/bamn-arc-blk/800/1000', 0, '{"width": "240", "height": "300"}'),
    ('Raw',    'https://picsum.photos/seed/bamn-arc-raw/800/1000', 1, '{"width": "240", "height": "300"}'),
    ('Copper', 'https://picsum.photos/seed/bamn-arc-cop/800/1000', 2, '{"width": "240", "height": "300"}')
  ) as v(label, drive_id, sort_order, extras);

with lean as (
  insert into products (volume, name, description, materials, dimensions, sort_order, published, available)
  values (
    'Vol. 02 / Steel Objects', 'Lean Shelf',
    'A shelf that leans rather than attaches. No fixings to the wall; the geometry holds it upright.',
    'Powder-coated steel',
    'H 180 × W 80 × D 25 cm', 9, true, false
  ) returning id
)
insert into product_variants (product_id, label, drive_id, sort_order, extras)
select lean.id, v.label, v.drive_id, v.sort_order, v.extras::jsonb
from lean,
  (values
    ('Black', 'https://picsum.photos/seed/bamn-lean-blk/600/1100', 0, '{"width": "180", "height": "330"}')
  ) as v(label, drive_id, sort_order, extras);

with fold as (
  insert into products (volume, name, description, materials, dimensions, sort_order, published, available)
  values (
    'Vol. 02 / Steel Objects', 'Fold Stool',
    'Cut and folded from a single sheet of steel. The fold is the structure — nothing is added.',
    'Powder-coated steel',
    'H 46 × W 38 × D 38 cm', 10, true, true
  ) returning id
)
insert into product_variants (product_id, label, drive_id, sort_order, extras)
select fold.id, v.label, v.drive_id, v.sort_order, v.extras::jsonb
from fold,
  (values
    ('Matte', 'https://picsum.photos/seed/bamn-fold-mat/700/900', 0, '{"width": "210", "height": "270"}'),
    ('Gloss', 'https://picsum.photos/seed/bamn-fold-gls/700/900', 1, '{"width": "210", "height": "270"}')
  ) as v(label, drive_id, sort_order, extras);
