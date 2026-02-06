ALTER TABLE "permissions" DROP CONSTRAINT "permissions_title_unique";--> statement-breakpoint
ALTER TABLE "roles" DROP CONSTRAINT "roles_title_unique";--> statement-breakpoint
ALTER TABLE "permissions" ADD COLUMN "name" varchar(100) NOT NULL;--> statement-breakpoint
ALTER TABLE "roles" ADD COLUMN "name" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "name" varchar(255);--> statement-breakpoint
ALTER TABLE "permissions" DROP COLUMN "title";--> statement-breakpoint
ALTER TABLE "roles" DROP COLUMN "title";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "title";--> statement-breakpoint
ALTER TABLE "permissions" ADD CONSTRAINT "permissions_name_unique" UNIQUE("name");--> statement-breakpoint
ALTER TABLE "roles" ADD CONSTRAINT "roles_name_unique" UNIQUE("name");