CREATE TABLE "galleries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"url" text NOT NULL,
	"path" text NOT NULL,
	"filename" varchar(255) NOT NULL,
	"size" integer NOT NULL,
	"mime_type" varchar(100) NOT NULL,
	"alt_text" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"created_by" varchar
);
