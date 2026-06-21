-- project_sections: rich content blocks attached to a project (image + optional text).
-- img_position controls layout in the front-end CustomComp component.

create table if not exists project_sections (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references projects(id) on delete cascade,
  text        text,
  img         text not null,  -- Google Drive file ID or URL
  img_position text not null check (img_position in ('top', 'bottom', 'left', 'right')),
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now()
);

create index if not exists project_sections_project_id_idx
  on project_sections (project_id, sort_order);

-- RLS: public read, no anonymous writes
alter table project_sections enable row level security;

create policy "project_sections_select"
  on project_sections for select
  using (true);
