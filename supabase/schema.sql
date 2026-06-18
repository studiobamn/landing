-- =========================================
-- BAMN — starter schema (pre-state)
-- Edit columns/tables freely as needs change.
-- Run in the Supabase SQL editor. Treat this file as living documentation
-- of the current schema, not a locked migration.
-- Media: store Google Drive FILE IDs, not URLs.
-- =========================================

-- PROJECTS
create table if not exists projects (
  id           uuid primary key default gen_random_uuid(),
  number       text,                       -- display number e.g. "01"
  slug         text unique,                -- for future /projects/[slug]
  title        text not null,
  year         text,
  category     text,
  location     text,
  description  text,
  cover_drive_id text,                     -- Google Drive file ID for cover
  tags         text[],                     -- optional material/keyword tags
  sort_order   int default 0,              -- manual ordering
  published    boolean default true,
  created_at   timestamptz default now()
);

-- optional: extra gallery images per project (v2)
create table if not exists project_images (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid references projects(id) on delete cascade,
  drive_id    text not null,
  sort_order  int default 0
);

-- PRODUCTS (current line / volume)
create table if not exists products (
  id           uuid primary key default gen_random_uuid(),
  volume       text,                       -- e.g. "Vol. 01"
  line_name    text,                       -- e.g. "Objects in Steel"
  name         text not null,
  description  text,
  materials    text,
  dimensions   text,
  sort_order   int default 0,
  published    boolean default true,
  created_at   timestamptz default now()
);

-- product variations (one row per variant)
create table if not exists product_variants (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid references products(id) on delete cascade,
  label       text,                        -- e.g. "Black", "Red", "Raw"
  drive_id    text not null,               -- Google Drive file ID for this variant image
  sort_order  int default 0
);

-- TEAM (About view)
create table if not exists team_members (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  role         text,
  note         text,                       -- personal fragment / phrase
  name_drive_id text,                      -- handwritten name asset (Drive file ID)
  sort_order   int default 0,
  published    boolean default true,
  created_at   timestamptz default now()
);

-- rotation frames per member (sprite-sheet sequence)
create table if not exists team_rotation_frames (
  id          uuid primary key default gen_random_uuid(),
  member_id   uuid references team_members(id) on delete cascade,
  drive_id    text not null,
  frame_index int not null                 -- 0..N order of rotation
);

-- scattered sketch assets per member
create table if not exists team_assets (
  id          uuid primary key default gen_random_uuid(),
  member_id   uuid references team_members(id) on delete cascade,
  type        text,                        -- 'sketch' | 'tag' | 'swatch' etc.
  drive_id    text not null,
  pos_x       text,                        -- e.g. "12%"
  pos_y       text,                        -- e.g. "20%"
  depth       text default 'back'          -- 'front' | 'back' for parallax
);

-- SITE CONTENT (single-row-ish editable copy: manifesto, contact, home poem)
create table if not exists site_content (
  key          text primary key,           -- e.g. 'home_poem', 'about_manifesto', 'contact'
  value        jsonb                        -- flexible blob per section
);

-- =========================================
-- Row Level Security — public READ for anon.
-- The site reads everything with the anon key. When RLS is enabled (the
-- default for tables made in the dashboard) but no policy exists, anon gets
-- ZERO rows back with NO error. These policies grant read-only access.
-- Writes are NOT granted: content is edited via the dashboard (service role).
-- Safe to re-run.
-- =========================================
do $$
declare t text;
begin
  foreach t in array array[
    'projects','project_images','products','product_variants',
    'team_members','team_rotation_frames','team_assets','site_content'
  ] loop
    execute format('alter table %I enable row level security;', t);
    execute format('drop policy if exists "public read" on %I;', t);
    execute format('create policy "public read" on %I for select using (true);', t);
  end loop;
end $$;
