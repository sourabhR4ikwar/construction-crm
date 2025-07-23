import {
  pgTable,
  text,
  timestamp,
  boolean,
  pgEnum,
  decimal,
  date,
} from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("user_role", ["admin", "staff", "readonly"]);

export const companyTypeEnum = pgEnum("company_type", [
  "developer",
  "contractor", 
  "architect_consultant",
  "supplier_vendor"
]);

export const contactRoleEnum = pgEnum("contact_role", [
  "primary_contact",
  "project_manager",
  "technical_lead",
  "finance_contact",
  "sales_contact",
  "support_contact",
  "executive",
  "other"
]);

export const projectStageEnum = pgEnum("project_stage", [
  "design",
  "construction",
  "hand_off"
]);

export const projectStatusEnum = pgEnum("project_status", [
  "planning",
  "active", 
  "on_hold",
  "completed"
]);

export const projectRoleEnum = pgEnum("project_role", [
  "developer",
  "client_stakeholder",
  "contractor",
  "architect_consultant",
  "project_manager",
  "supplier_vendor"
]);

export const interactionTypeEnum = pgEnum("interaction_type", [
  "meeting",
  "phone_call",
  "email",
  "site_visit",
  "document_shared",
  "milestone_update",
  "issue_reported",
  "other"
]);

export const documentTypeEnum = pgEnum("document_type", [
  "drawings_plans",
  "contracts",
  "permits",
  "reports",
  "specifications",
  "correspondence",
  "photos",
  "other"
]);

export const documentAccessLevelEnum = pgEnum("document_access_level", [
  "public",
  "project_members",
  "admin_only"
]);

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified")
    .$defaultFn(() => false)
    .notNull(),
  image: text("image"),
  role: roleEnum("role").default("readonly").notNull(),
  createdAt: timestamp("created_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").$defaultFn(
    () => /* @__PURE__ */ new Date(),
  ),
  updatedAt: timestamp("updated_at").$defaultFn(
    () => /* @__PURE__ */ new Date(),
  ),
});

export const company = pgTable("company", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  type: companyTypeEnum("type").notNull(),
  description: text("description"),
  website: text("website"),
  phone: text("phone"),
  email: text("email"),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  zipCode: text("zip_code"),
  country: text("country"),
  createdAt: timestamp("created_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const contact = pgTable("contact", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  role: contactRoleEnum("role").notNull(),
  title: text("title"),
  department: text("department"),
  notes: text("notes"),
  companyId: text("company_id")
    .notNull()
    .references(() => company.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const project = pgTable("project", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  budget: decimal("budget", { precision: 15, scale: 2 }),
  startDate: date("start_date"),
  endDate: date("end_date"),
  stage: projectStageEnum("stage").notNull().default("design"),
  status: projectStatusEnum("status").notNull().default("planning"),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  zipCode: text("zip_code"),
  country: text("country"),
  createdAt: timestamp("created_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  createdBy: text("created_by")
    .notNull()
    .references(() => user.id),
});

export const projectRoleAssignment = pgTable("project_role_assignment", {
  id: text("id").primaryKey(),
  projectId: text("project_id")
    .notNull()
    .references(() => project.id, { onDelete: "cascade" }),
  contactId: text("contact_id")
    .notNull()
    .references(() => contact.id, { onDelete: "cascade" }),
  role: projectRoleEnum("role").notNull(),
  assignedAt: timestamp("assigned_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  assignedBy: text("assigned_by")
    .notNull()
    .references(() => user.id),
});

export const projectInteraction = pgTable("project_interaction", {
  id: text("id").primaryKey(),
  projectId: text("project_id")
    .notNull()
    .references(() => project.id, { onDelete: "cascade" }),
  type: interactionTypeEnum("type").notNull(),
  summary: text("summary").notNull(),
  description: text("description"),
  interactionDate: timestamp("interaction_date").notNull(),
  contactId: text("contact_id")
    .references(() => contact.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  createdBy: text("created_by")
    .notNull()
    .references(() => user.id),
});

export const projectDocument = pgTable("project_document", {
  id: text("id").primaryKey(),
  projectId: text("project_id")
    .notNull()
    .references(() => project.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  type: documentTypeEnum("type").notNull(),
  currentVersion: text("current_version").notNull().default("1"),
  accessLevel: documentAccessLevelEnum("access_level").notNull().default("project_members"),
  tags: text("tags"), // JSON array of tags
  createdAt: timestamp("created_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  createdBy: text("created_by")
    .notNull()
    .references(() => user.id),
});

export const projectDocumentVersion = pgTable("project_document_version", {
  id: text("id").primaryKey(),
  documentId: text("document_id")
    .notNull()
    .references(() => projectDocument.id, { onDelete: "cascade" }),
  version: text("version").notNull(),
  fileName: text("file_name").notNull(),
  fileSize: text("file_size").notNull(), // in bytes as string
  mimeType: text("mime_type").notNull(),
  storageKey: text("storage_key").notNull(), // R2 storage key
  checksum: text("checksum"), // file hash for integrity
  versionNotes: text("version_notes"),
  createdAt: timestamp("created_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  uploadedBy: text("uploaded_by")
    .notNull()
    .references(() => user.id),
});

export const documentAccessLog = pgTable("document_access_log", {
  id: text("id").primaryKey(),
  documentId: text("document_id")
    .notNull()
    .references(() => projectDocument.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  action: text("action").notNull(), // "view", "download", "share"
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  accessedAt: timestamp("accessed_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
});


export const schema = {
  user,
  session,
  account,
  verification,
  company,
  contact,
  project,
  projectRoleAssignment,
  projectInteraction,
  projectDocument,
  projectDocumentVersion,
  documentAccessLog,
}
