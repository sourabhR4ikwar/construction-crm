CREATE TYPE "public"."company_type" AS ENUM('developer', 'contractor', 'architect_consultant', 'supplier_vendor');--> statement-breakpoint
CREATE TABLE "company" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"type" "company_type" NOT NULL,
	"description" text,
	"website" text,
	"phone" text,
	"email" text,
	"address" text,
	"city" text,
	"state" text,
	"zip_code" text,
	"country" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
