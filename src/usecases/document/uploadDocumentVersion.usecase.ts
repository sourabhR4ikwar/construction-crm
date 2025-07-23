import { DocumentRepository, UploadDocumentVersionData } from "@/repo/document/document.repo";
import { z } from "zod";

export const uploadDocumentVersionSchema = z.object({
  documentId: z.string().min(1, "Document ID is required"),
  fileName: z.string().min(1, "File name is required"),
  fileBuffer: z.instanceof(Buffer),
  mimeType: z.string().min(1, "MIME type is required"),
  fileSize: z.number().positive("File size must be positive"),
  versionNotes: z.string().optional(),
});

export type UploadDocumentVersionInput = z.infer<typeof uploadDocumentVersionSchema>;

export class UploadDocumentVersionUsecase {
  constructor(private documentRepo: DocumentRepository) {}

  async execute(data: UploadDocumentVersionInput) {
    const validatedData = uploadDocumentVersionSchema.parse(data);
    
    // Validate file size (max 100MB)
    const maxFileSize = 100 * 1024 * 1024; // 100MB in bytes
    if (validatedData.fileSize > maxFileSize) {
      throw new Error("File size exceeds maximum limit of 100MB");
    }
    
    // Validate file type based on MIME type
    const allowedMimeTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'application/zip',
      'image/svg+xml',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ];
    
    if (!allowedMimeTypes.includes(validatedData.mimeType)) {
      throw new Error("File type not supported");
    }
    
    const documentVersion = await this.documentRepo.uploadDocumentVersion(validatedData);
    
    return documentVersion;
  }
}