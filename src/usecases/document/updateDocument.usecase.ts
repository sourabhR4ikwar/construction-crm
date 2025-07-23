import { DocumentRepository } from "@/repo/document/document.repo";
import { z } from "zod";

export const updateDocumentSchema = z.object({
  documentId: z.string().min(1, "Document ID is required"),
  name: z.string().min(1, "Document name is required").max(255, "Name must be 255 characters or less").optional(),
  description: z.string().optional(),
  type: z.enum([
    "drawings_plans",
    "contracts", 
    "permits",
    "reports",
    "specifications",
    "correspondence",
    "photos",
    "other"
  ]).optional(),
  accessLevel: z.enum(["public", "project_members", "admin_only"]).optional(),
  tags: z.array(z.string()).optional(),
});

export type UpdateDocumentInput = z.infer<typeof updateDocumentSchema>;

export class UpdateDocumentUsecase {
  constructor(private documentRepo: DocumentRepository) {}

  async execute(data: UpdateDocumentInput) {
    const validatedData = updateDocumentSchema.parse(data);
    
    const { documentId, ...updateData } = validatedData;
    
    const document = await this.documentRepo.updateDocument(documentId, updateData);
    
    return document;
  }
}