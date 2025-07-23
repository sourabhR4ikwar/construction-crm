#!/usr/bin/env node

const { drizzle } = require('drizzle-orm/node-postgres');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const db = drizzle({ client: pool });

async function createDocumentTables() {
  try {
    console.log('Creating document-related enums and tables...');

    // Create document_access_level enum
    await pool.query(`
      DO $$ BEGIN
        CREATE TYPE "public"."document_access_level" AS ENUM('public', 'project_members', 'admin_only');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    console.log('✓ Created document_access_level enum');

    // Create document_type enum
    await pool.query(`
      DO $$ BEGIN
        CREATE TYPE "public"."document_type" AS ENUM('drawings_plans', 'contracts', 'permits', 'reports', 'specifications', 'correspondence', 'photos', 'other');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    console.log('✓ Created document_type enum');

    // Create project_document table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "project_document" (
        "id" text PRIMARY KEY NOT NULL,
        "project_id" text NOT NULL,
        "name" text NOT NULL,
        "description" text,
        "type" "document_type" NOT NULL,
        "current_version" text DEFAULT '1' NOT NULL,
        "access_level" "document_access_level" DEFAULT 'project_members' NOT NULL,
        "tags" text,
        "created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
        "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
        "created_by" text NOT NULL
      );
    `);
    console.log('✓ Created project_document table');

    // Create project_document_version table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "project_document_version" (
        "id" text PRIMARY KEY NOT NULL,
        "document_id" text NOT NULL,
        "version" text NOT NULL,
        "file_name" text NOT NULL,
        "file_size" text NOT NULL,
        "mime_type" text NOT NULL,
        "storage_key" text NOT NULL,
        "checksum" text,
        "version_notes" text,
        "created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
        "uploaded_by" text NOT NULL
      );
    `);
    console.log('✓ Created project_document_version table');

    // Create document_access_log table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "document_access_log" (
        "id" text PRIMARY KEY NOT NULL,
        "document_id" text NOT NULL,
        "user_id" text NOT NULL,
        "action" text NOT NULL,
        "ip_address" text,
        "user_agent" text,
        "accessed_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
    `);
    console.log('✓ Created document_access_log table');

    // Add foreign key constraints
    console.log('Adding foreign key constraints...');

    await pool.query(`
      DO $$ BEGIN
        ALTER TABLE "project_document" ADD CONSTRAINT "project_document_project_id_project_id_fk" 
        FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    console.log('✓ Added project_document -> project foreign key');

    await pool.query(`
      DO $$ BEGIN
        ALTER TABLE "project_document" ADD CONSTRAINT "project_document_created_by_user_id_fk" 
        FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    console.log('✓ Added project_document -> user foreign key');

    await pool.query(`
      DO $$ BEGIN
        ALTER TABLE "project_document_version" ADD CONSTRAINT "project_document_version_document_id_project_document_id_fk" 
        FOREIGN KEY ("document_id") REFERENCES "public"."project_document"("id") ON DELETE cascade ON UPDATE no action;
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    console.log('✓ Added project_document_version -> project_document foreign key');

    await pool.query(`
      DO $$ BEGIN
        ALTER TABLE "project_document_version" ADD CONSTRAINT "project_document_version_uploaded_by_user_id_fk" 
        FOREIGN KEY ("uploaded_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    console.log('✓ Added project_document_version -> user foreign key');

    await pool.query(`
      DO $$ BEGIN
        ALTER TABLE "document_access_log" ADD CONSTRAINT "document_access_log_document_id_project_document_id_fk" 
        FOREIGN KEY ("document_id") REFERENCES "public"."project_document"("id") ON DELETE cascade ON UPDATE no action;
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    console.log('✓ Added document_access_log -> project_document foreign key');

    await pool.query(`
      DO $$ BEGIN
        ALTER TABLE "document_access_log" ADD CONSTRAINT "document_access_log_user_id_user_id_fk" 
        FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    console.log('✓ Added document_access_log -> user foreign key');

    console.log('\n🎉 Successfully created all document tables and constraints!');
    
  } catch (error) {
    console.error('❌ Error creating document tables:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

createDocumentTables();