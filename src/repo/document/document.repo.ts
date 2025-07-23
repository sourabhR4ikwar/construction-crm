import { db } from "@/lib/db";
import { 
  projectDocument, 
  projectDocumentVersion, 
  documentAccessLog,
  project 
} from "@/lib/db/schema";
import { BaseRepository } from "../base.repo";
import { User } from "@/lib/auth";
import { eq, and, desc } from "drizzle-orm";
import { R2Storage } from "@/lib/storage";
import { v4 as uuidv4 } from "uuid";

export interface CreateDocumentData {
  projectId: string;
  name: string;
  description?: string;
  type: "drawings_plans" | "contracts" | "permits" | "reports" | "specifications" | "correspondence" | "photos" | "other";
  accessLevel?: "public" | "project_members" | "admin_only";
  tags?: string[];
}

export interface UploadDocumentVersionData {
  documentId: string;
  fileName: string;
  fileBuffer: Buffer;
  mimeType: string;
  fileSize: number;
  versionNotes?: string;
}

export interface DocumentWithVersions {
  id: string;
  projectId: string;
  name: string;
  description: string | null;
  type: string;
  currentVersion: string;
  accessLevel: string;
  tags: string | null;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  versions: {
    id: string;
    version: string;
    fileName: string;
    fileSize: string;
    mimeType: string;
    storageKey: string;
    checksum: string | null;
    versionNotes: string | null;
    createdAt: Date;
    uploadedBy: string;
  }[];
}

export class DocumentRepository extends BaseRepository {
  constructor(user: User | null = null) {
    super(user);
  }

  async createDocument(data: CreateDocumentData) {
    this.authorize("write");

    // Verify user has access to the project
    await this.verifyProjectAccess(data.projectId, "write");

    const documentId = uuidv4();
    
    const [newDocument] = await db
      .insert(projectDocument)
      .values({
        id: documentId,
        projectId: data.projectId,
        name: data.name,
        description: data.description,
        type: data.type,
        accessLevel: data.accessLevel || "project_members",
        tags: data.tags ? JSON.stringify(data.tags) : null,
        createdBy: this.user!.id,
      })
      .returning();

    return newDocument;
  }

  async uploadDocumentVersion(data: UploadDocumentVersionData) {
    this.authorize("write");

    // Get document and verify access
    const document = await this.getDocumentById(data.documentId);
    if (!document) {
      throw new Error("Document not found");
    }

    await this.verifyProjectAccess(document.projectId, "write");

    // Get next version number
    const latestVersions = await db
      .select()
      .from(projectDocumentVersion)
      .where(eq(projectDocumentVersion.documentId, data.documentId))
      .orderBy(desc(projectDocumentVersion.createdAt))
      .limit(1);

    const nextVersion = latestVersions.length > 0 
      ? (parseInt(latestVersions[0].version) + 1).toString()
      : "1";

    // Generate storage key and upload to R2
    const storageKey = R2Storage.generateDocumentKey(
      document.projectId, 
      data.fileName, 
      parseInt(nextVersion)
    );

    await R2Storage.uploadFile({
      key: storageKey,
      file: data.fileBuffer,
      contentType: data.mimeType,
      metadata: {
        documentId: data.documentId,
        version: nextVersion,
        uploadedBy: this.user!.id,
      }
    });

    // Create version record
    const versionId = uuidv4();
    const [newVersion] = await db
      .insert(projectDocumentVersion)
      .values({
        id: versionId,
        documentId: data.documentId,
        version: nextVersion,
        fileName: data.fileName,
        fileSize: data.fileSize.toString(),
        mimeType: data.mimeType,
        storageKey: storageKey,
        versionNotes: data.versionNotes,
        uploadedBy: this.user!.id,
      })
      .returning();

    // Update document's current version
    await db
      .update(projectDocument)
      .set({ 
        currentVersion: nextVersion,
        updatedAt: new Date()
      })
      .where(eq(projectDocument.id, data.documentId));

    return newVersion;
  }

  async getDocumentById(documentId: string) {
    this.authorize("read");

    const [document] = await db
      .select()
      .from(projectDocument)
      .where(eq(projectDocument.id, documentId))
      .limit(1);

    if (!document) {
      return null;
    }

    // Verify access to the project
    await this.verifyProjectAccess(document.projectId, "read");

    return document;
  }

  async getDocumentWithVersions(documentId: string): Promise<DocumentWithVersions | null> {
    this.authorize("read");

    const document = await this.getDocumentById(documentId);
    if (!document) {
      return null;
    }

    const versions = await db
      .select()
      .from(projectDocumentVersion)
      .where(eq(projectDocumentVersion.documentId, documentId))
      .orderBy(desc(projectDocumentVersion.createdAt));

    return {
      ...document,
      versions,
    };
  }

  async getProjectDocuments(projectId: string) {
    this.authorize("read");
    await this.verifyProjectAccess(projectId, "read");

    const documents = await db
      .select()
      .from(projectDocument)
      .where(eq(projectDocument.projectId, projectId))
      .orderBy(desc(projectDocument.updatedAt));

    return documents;
  }

  async getDocumentDownloadUrl(documentId: string, version?: string) {
    this.authorize("read");

    const document = await this.getDocumentById(documentId);
    if (!document) {
      throw new Error("Document not found");
    }

    await this.verifyProjectAccess(document.projectId, "read");

    // Get the specific version or latest version
    let documentVersion;
    if (version) {
      [documentVersion] = await db
        .select()
        .from(projectDocumentVersion)
        .where(
          and(
            eq(projectDocumentVersion.documentId, documentId),
            eq(projectDocumentVersion.version, version)
          )
        )
        .limit(1);
    } else {
      [documentVersion] = await db
        .select()
        .from(projectDocumentVersion)
        .where(eq(projectDocumentVersion.documentId, documentId))
        .orderBy(desc(projectDocumentVersion.createdAt))
        .limit(1);
    }

    if (!documentVersion) {
      throw new Error("Document version not found");
    }

    // Log access
    await this.logDocumentAccess(documentId, "download");

    // Generate presigned URL
    const downloadUrl = await R2Storage.getFileUrl({
      key: documentVersion.storageKey,
      expiresIn: 3600, // 1 hour
    });

    return {
      downloadUrl,
      fileName: documentVersion.fileName,
      mimeType: documentVersion.mimeType,
      fileSize: documentVersion.fileSize,
    };
  }

  async updateDocument(documentId: string, updates: Partial<CreateDocumentData>) {
    this.authorize("write");

    const document = await this.getDocumentById(documentId);
    if (!document) {
      throw new Error("Document not found");
    }

    await this.verifyProjectAccess(document.projectId, "write");

    const [updatedDocument] = await db
      .update(projectDocument)
      .set({
        ...updates,
        tags: updates.tags ? JSON.stringify(updates.tags) : undefined,
        updatedAt: new Date(),
      })
      .where(eq(projectDocument.id, documentId))
      .returning();

    return updatedDocument;
  }

  async deleteDocument(documentId: string) {
    this.authorize("delete");

    const document = await this.getDocumentById(documentId);
    if (!document) {
      throw new Error("Document not found");
    }

    await this.verifyProjectAccess(document.projectId, "delete");

    // Get all versions to delete from storage
    const versions = await db
      .select()
      .from(projectDocumentVersion)
      .where(eq(projectDocumentVersion.documentId, documentId));

    // Delete files from R2 storage
    for (const version of versions) {
      try {
        await R2Storage.deleteFile(version.storageKey);
      } catch (error) {
        console.error(`Failed to delete file from storage: ${version.storageKey}`, error);
      }
    }

    // Delete document (versions and access logs will be cascade deleted)
    await db
      .delete(projectDocument)
      .where(eq(projectDocument.id, documentId));

    return true;
  }

  async searchDocuments(projectId: string, query: string, type?: string) {
    this.authorize("read");
    await this.verifyProjectAccess(projectId, "read");

    const whereConditions = [eq(projectDocument.projectId, projectId)];
    
    if (type) {
      whereConditions.push(eq(projectDocument.type, type as "drawings_plans" | "contracts" | "permits" | "reports" | "specifications" | "correspondence" | "photos" | "other"));
    }

    // Simple text search in name and description
    const documents = await db
      .select()
      .from(projectDocument)
      .where(and(...whereConditions))
      .orderBy(desc(projectDocument.updatedAt));

    // Filter by query in memory (for simplicity)
    const filteredDocuments = documents.filter(doc => 
      doc.name.toLowerCase().includes(query.toLowerCase()) ||
      (doc.description && doc.description.toLowerCase().includes(query.toLowerCase()))
    );

    return filteredDocuments;
  }

  private async verifyProjectAccess(projectId: string, _action: "read" | "write" | "delete") {
    // For now, we'll check if the project exists and user has general permissions
    // In a more complex system, we might check project-specific permissions
    const [projectExists] = await db
      .select()
      .from(project)
      .where(eq(project.id, projectId))
      .limit(1);

    if (!projectExists) {
      throw new Error("Project not found");
    }

    // Additional access control logic could be added here
    // For example, checking if user is assigned to the project
  }

  private async logDocumentAccess(documentId: string, action: "view" | "download" | "share") {
    if (!this.user) return;

    await db
      .insert(documentAccessLog)
      .values({
        id: uuidv4(),
        documentId,
        userId: this.user.id,
        action,
      });
  }
}