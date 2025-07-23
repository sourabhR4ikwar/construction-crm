import { DocumentRepository } from "@/repo/document/document.repo";
import { z } from "zod";

export const getDocumentSchema = z.object({
  documentId: z.string().min(1, "Document ID is required"),
  includeVersions: z.boolean().optional().default(false),
});

export type GetDocumentInput = z.infer<typeof getDocumentSchema>;

export class GetDocumentUsecase {
  constructor(private documentRepo: DocumentRepository) {}

  async execute(data: GetDocumentInput) {
    const validatedData = getDocumentSchema.parse(data);
    
    if (validatedData.includeVersions) {
      const document = await this.documentRepo.getDocumentWithVersions(validatedData.documentId);
      if (!document) {
        throw new Error("Document not found");
      }
      return document;
    } else {
      const document = await this.documentRepo.getDocumentById(validatedData.documentId);
      if (!document) {
        throw new Error("Document not found");
      }
      return document;
    }
  }
}