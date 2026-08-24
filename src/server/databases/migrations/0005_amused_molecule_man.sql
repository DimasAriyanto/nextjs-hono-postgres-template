ALTER TABLE "app_settings" DROP CONSTRAINT "app_settings_key_unique";--> statement-breakpoint
ALTER TABLE "app_settings" ADD COLUMN "locale" varchar(10) DEFAULT '' NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "app_settings_key_locale_idx" ON "app_settings" USING btree ("key","locale");