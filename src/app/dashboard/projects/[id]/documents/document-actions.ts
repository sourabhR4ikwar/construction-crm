"use server";

import { DocumentRepository } from "@/repo/document/document.repo";
import { CreateDocumentUsecase } from "@/usecases/document/createDocument.usecase";
import { UploadDocumentVersionUsecase } from "@/usecases/document/uploadDocumentVersion.usecase";
import { ListProjectDocumentsUsecase } from "@/usecases/document/listProjectDocuments.usecase";
import { GetDocumentDownloadUrlUsecase } from "@/usecases/document/getDocumentDownloadUrl.usecase";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

export async function getProjectDocumentsAction(projectId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) {
    redirect("/login");
  }

  const documentRepo = new DocumentRepository(session.user);
  const listDocumentsUsecase = new ListProjectDocumentsUsecase(documentRepo);

  try {
    const documents = await listDocumentsUsecase.execute({
      projectId,
    });

    return { success: true, data: documents };
  } catch (error) {
    console.error("Failed to get project documents:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to get documents" 
    };
  }
}

export async function createDocumentAction(data: {
  projectId: string;
  name: string;
  description?: string;
  type: string;
  accessLevel?: string;
  tags?: string[];
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) {
    redirect("/login");
  }

  const documentRepo = new DocumentRepository(session.user);
  const createDocumentUsecase = new CreateDocumentUsecase(documentRepo);

  try {
    const document = await createDocumentUsecase.execute({
      ...data,
      type: data.type as "drawings_plans" | "contracts" | "permits" | "reports" | "specifications" | "correspondence" | "photos" | "other",
      accessLevel: data.accessLevel as "public" | "project_members" | "admin_only" | undefined,
    });

    return { success: true, data: document };
  } catch (error) {
    console.error("Failed to create document:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to create document" 
    };
  }
}

export async function createDocumentWithFileAction(formData: FormData) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) {
    redirect("/login");
  }

  const file = formData.get("file") as File;
  const name = formData.get("name") as string;
  const projectId = formData.get("projectId") as string;
  const type = formData.get("type") as string;
  const description = formData.get("description") as string;
  const accessLevel = formData.get("accessLevel") as string;
  const versionNotes = formData.get("versionNotes") as string;
  const tagsJson = formData.get("tags") as string;

  if (!file || !name || !projectId || !type) {
    return { success: false, error: "Missing required fields" };
  }

  const documentRepo = new DocumentRepository(session.user);
  const createDocumentUsecase = new CreateDocumentUsecase(documentRepo);
  const uploadVersionUsecase = new UploadDocumentVersionUsecase(documentRepo);

  try {
    // First create the document
    const document = await createDocumentUsecase.execute({
      projectId,
      name,
      description: description || undefined,
      type: type as "drawings_plans" | "contracts" | "permits" | "reports" | "specifications" | "correspondence" | "photos" | "other",
      accessLevel: accessLevel as "public" | "project_members" | "admin_only" | undefined,
      tags: tagsJson ? JSON.parse(tagsJson) : undefined,
    });

    // Then upload the first version
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    
    const version = await uploadVersionUsecase.execute({
      documentId: document.id,
      fileName: file.name,
      fileBuffer,
      mimeType: file.type,
      fileSize: file.size,
      versionNotes: versionNotes || undefined,
    });

    return { success: true, data: { document, version } };
  } catch (error) {
    console.error("Failed to create document with file:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to create document" 
    };
  }
}

export async function uploadDocumentVersionAction(
  documentId: string,
  formData: FormData
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) {
    redirect("/login");
  }

  const file = formData.get("file") as File;
  const versionNotes = formData.get("versionNotes") as string;

  if (!file) {
    return { success: false, error: "No file provided" };
  }

  const documentRepo = new DocumentRepository(session.user);
  const uploadVersionUsecase = new UploadDocumentVersionUsecase(documentRepo);

  try {
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    
    const version = await uploadVersionUsecase.execute({
      documentId,
      fileName: file.name,
      fileBuffer,
      mimeType: file.type,
      fileSize: file.size,
      versionNotes: versionNotes || undefined,
    });

    return { success: true, data: version };
  } catch (error) {
    console.error("Failed to upload document version:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to upload version" 
    };
  }
}

export async function getDocumentDownloadUrlAction(documentId: string, version?: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) {
    redirect("/login");
  }

  const documentRepo = new DocumentRepository(session.user);
  const getDownloadUrlUsecase = new GetDocumentDownloadUrlUsecase(documentRepo);

  try {
    const result = await getDownloadUrlUsecase.execute({
      documentId,
      version,
    });

    return { success: true, data: result };
  } catch (error) {
    console.error("Failed to get download URL:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to get download URL" 
    };
  }
}