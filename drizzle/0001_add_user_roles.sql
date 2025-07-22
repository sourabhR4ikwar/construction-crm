CREATE TYPE "public"."user_role" AS ENUM('admin', 'staff', 'readonly');
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "role" "user_role" DEFAULT 'readonly' NOT NULL;