ALTER TABLE "refresh_tokens" ADD COLUMN "revoked_reason" varchar(20);--> statement-breakpoint
ALTER TABLE "refresh_tokens" ADD COLUMN "rotation_grace_until" timestamp;
