ALTER TABLE "users" ADD COLUMN "email_verified_at" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "verification_token" varchar(255);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "verification_token_expires_at" timestamp;