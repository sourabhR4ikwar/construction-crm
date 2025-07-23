CREATE TYPE "public"."interaction_type" AS ENUM('meeting', 'phone_call', 'email', 'site_visit', 'document_shared', 'milestone_update', 'issue_reported', 'other');--> statement-breakpoint
CREATE TYPE "public"."project_role" AS ENUM('developer', 'client_stakeholder', 'contractor', 'architect_consultant', 'project_manager', 'supplier_vendor');--> statement-breakpoint
CREATE TYPE "public"."project_stage" AS ENUM('design', 'construction', 'hand_off');--> statement-breakpoint
CREATE TABLE "project" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"budget" numeric(15, 2),
	"start_date" date,
	"end_date" date,
	"stage" "project_stage" DEFAULT 'design' NOT NULL,
	"address" text,
	"city" text,
	"state" text,
	"zip_code" text,
	"country" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"created_by" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_interaction" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"type" "interaction_type" NOT NULL,
	"summary" text NOT NULL,
	"description" text,
	"interaction_date" timestamp NOT NULL,
	"contact_id" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"created_by" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_role_assignment" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"contact_id" text NOT NULL,
	"role" "project_role" NOT NULL,
	"assigned_at" timestamp NOT NULL,
	"assigned_by" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "project" ADD CONSTRAINT "project_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_interaction" ADD CONSTRAINT "project_interaction_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_interaction" ADD CONSTRAINT "project_interaction_contact_id_contact_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contact"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_interaction" ADD CONSTRAINT "project_interaction_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_role_assignment" ADD CONSTRAINT "project_role_assignment_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_role_assignment" ADD CONSTRAINT "project_role_assignment_contact_id_contact_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contact"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_role_assignment" ADD CONSTRAINT "project_role_assignment_assigned_by_user_id_fk" FOREIGN KEY ("assigned_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;