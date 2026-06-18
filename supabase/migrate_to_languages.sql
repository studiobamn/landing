-- Migration: remove text columns now managed by the languages table.
-- Run this AFTER confirming seed_languages.sql has been applied.

-- Products: description, materials, line_name are now in db.products.{slug}.*
ALTER TABLE products DROP COLUMN IF EXISTS description;
ALTER TABLE products DROP COLUMN IF EXISTS materials;
ALTER TABLE products DROP COLUMN IF EXISTS line_name;

-- Projects: description and description_short are now in db.projects.{slug}.*
-- Keeping: phrases (provides phrase count), category (translation key lookup)
ALTER TABLE projects DROP COLUMN IF EXISTS description;
ALTER TABLE projects DROP COLUMN IF EXISTS description_short;

-- site_content rows whose full content is now in the languages table
DELETE FROM site_content WHERE key = 'about-manifesto';
DELETE FROM site_content WHERE key = 'about-footer_meta_line1';
DELETE FROM site_content WHERE key = 'about-footer_meta_line2';
DELETE FROM site_content WHERE key = 'about-vertical_label_line2';
DELETE FROM site_content WHERE key = 'projects_quote';

-- product_line: keep only volume; lineName and subtitle are in db.productLine.*
UPDATE site_content
SET value = jsonb_build_object('volume', value->>'volume')
WHERE key = 'product_line';
