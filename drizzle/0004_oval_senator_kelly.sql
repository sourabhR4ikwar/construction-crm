CREATE TYPE "public"."contact_role" AS ENUM('primary_contact', 'project_manager', 'technical_lead', 'finance_contact', 'sales_contact', 'support_contact', 'executive', 'other');--> statement-breakpoint
CREATE TABLE "contact" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"role" "contact_role" NOT NULL,
	"title" text,
	"department" text,
	"notes" text,
	"company_id" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "contact" ADD CONSTRAINT "contact_company_id_company_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."company"("id") ON DELETE cascade ON UPDATE no action;