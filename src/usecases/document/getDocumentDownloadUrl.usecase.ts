import { DocumentRepository } from "@/repo/document/document.repo";
import { z } from "zod";

export const getDocumentDownloadUrlSchema = z.object({
  documentId: z.string().min(1, "Document ID is required"),
  version: z.string().optional(),
});

export type GetDocumentDownloadUrlInput = z.infer<typeof getDocumentDownloadUrlSchema>;

export class GetDocumentDownloadUrlUsecase {
  constructor(private documentRepo: DocumentRepository) {}

  async execute(data: GetDocumentDownloadUrlInput) {
    const validatedData = getDocumentDownloadUrlSchema.parse(data);
    
    const result = await this.documentRepo.getDocumentDownloadUrl(
      validatedData.documentId,
      validatedData.version
    );
    
    return result;
  }
}