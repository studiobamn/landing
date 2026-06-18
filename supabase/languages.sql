-- Languages table — stores UI translation strings per locale.
-- label: BCP-47 short code (e.g. "en", "es")
-- language: human-readable name shown in the switcher
-- content: flat-ish JSON object consumed by react-i18next

CREATE TABLE IF NOT EXISTS languages (
  id       serial       PRIMARY KEY,
  label    varchar(10)  NOT NULL UNIQUE,
  language text         NOT NULL,
  content  jsonb        NOT NULL DEFAULT '{}'
);

-- Read-only for everyone (anon + authenticated).
ALTER TABLE languages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "languages_select"
  ON languages
  FOR SELECT
  USING (true);
