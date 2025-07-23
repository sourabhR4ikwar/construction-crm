import { DocumentRepository } from "@/repo/document/document.repo";
import { CreateDocumentUsecase } from "@/usecases/document/createDocument.usecase";
import { UploadDocumentVersionUsecase } from "@/usecases/document/uploadDocumentVersion.usecase";
import { GetDocumentUsecase } from "@/usecases/document/getDocument.usecase";
import { ListProjectDocumentsUsecase } from "@/usecases/document/listProjectDocuments.usecase";
import { GetDocumentDownloadUrlUsecase } from "@/usecases/document/getDocumentDownloadUrl.usecase";
import { UpdateDocumentUsecase } from "@/usecases/document/updateDocument.usecase";
import { DeleteDocumentUsecase } from "@/usecases/document/deleteDocument.usecase";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function getProjectDocuments(projectId: string, search?: string, type?: string) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const documentRepo = new DocumentRepository(session.user);
  const listDocumentsUsecase = new ListProjectDocumentsUsecase(documentRepo);

  try {
    const documents = await listDocumentsUsecase.execute({
      projectId,
      search,
      type: type as "drawings_plans" | "contracts" | "permits" | "reports" | "specifications" | "correspondence" | "photos" | "other" | undefined,
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

export async function createDocument(data: {
  projectId: string;
  name: string;
  description?: string;
  type: string;
  accessLevel?: string;
  tags?: string[];
}) {
  const session = await auth();
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

export async function uploadDocumentVersion(
  documentId: string,
  formData: FormData
) {
  const session = await auth();
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

export async function getDocumentWithVersions(documentId: string) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const documentRepo = new DocumentRepository(session.user);
  const getDocumentUsecase = new GetDocumentUsecase(documentRepo);

  try {
    const document = await getDocumentUsecase.execute({
      documentId,
      includeVersions: true,
    });

    return { success: true, data: document };
  } catch (error) {
    console.error("Failed to get document:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to get document" 
    };
  }
}

export async function getDocumentDownloadUrl(documentId: string, version?: string) {
  const session = await auth();
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

export async function updateDocument(
  documentId: string,
  data: {
    name?: string;
    description?: string;
    type?: string;
    accessLevel?: string;
    tags?: string[];
  }
) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const documentRepo = new DocumentRepository(session.user);
  const updateDocumentUsecase = new UpdateDocumentUsecase(documentRepo);

  try {
    const document = await updateDocumentUsecase.execute({
      documentId,
      ...data,
      type: data.type as "drawings_plans" | "contracts" | "permits" | "reports" | "specifications" | "correspondence" | "photos" | "other" | undefined,
      accessLevel: data.accessLevel as "public" | "project_members" | "admin_only" | undefined,
    });

    return { success: true, data: document };
  } catch (error) {
    console.error("Failed to update document:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to update document" 
    };
  }
}

export async function deleteDocument(documentId: string) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const documentRepo = new DocumentRepository(session.user);
  const deleteDocumentUsecase = new DeleteDocumentUsecase(documentRepo);

  try {
    const result = await deleteDocumentUsecase.execute({ documentId });
    return { success: true, data: result };
  } catch (error) {
    console.error("Failed to delete document:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to delete document" 
    };
  }
}

