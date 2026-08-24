-- Content added before the `locale` column existed landed with the column's default ('').
-- Attribute it to the default content locale ('id') so it stays reachable through the new
-- per-locale lookup instead of becoming orphaned.
UPDATE "app_settings"
SET "locale" = 'id'
WHERE "locale" = ''
	AND "key" IN ('about_content', 'terms_of_service', 'privacy_policy', 'faqs', 'banners');