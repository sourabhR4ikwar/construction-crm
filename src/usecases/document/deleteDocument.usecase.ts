import { DocumentRepository } from "@/repo/document/document.repo";
import { z } from "zod";

export const deleteDocumentSchema = z.object({
  documentId: z.string().min(1, "Document ID is required"),
});

export type DeleteDocumentInput = z.infer<typeof deleteDocumentSchema>;

export class DeleteDocumentUsecase {
  constructor(private documentRepo: DocumentRepository) {}

  async execute(data: DeleteDocumentInput) {
    const validatedData = deleteDocumentSchema.parse(data);
    
    const result = await this.documentRepo.deleteDocument(validatedData.documentId);
    
    return { success: result };
  }
}