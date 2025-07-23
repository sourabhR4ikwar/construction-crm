import { DocumentRepository } from "@/repo/document/document.repo";
import { z } from "zod";

export const listProjectDocumentsSchema = z.object({
  projectId: z.string().min(1, "Project ID is required"),
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
  search: z.string().optional(),
});

export type ListProjectDocumentsInput = z.infer<typeof listProjectDocumentsSchema>;

export class ListProjectDocumentsUsecase {
  constructor(private documentRepo: DocumentRepository) {}

  async execute(data: ListProjectDocumentsInput) {
    const validatedData = listProjectDocumentsSchema.parse(data);
    
    if (validatedData.search) {
      // Use search functionality
      const documents = await this.documentRepo.searchDocuments(
        validatedData.projectId,
        validatedData.search,
        validatedData.type
      );
      return documents;
    } else {
      // Get all project documents
      const documents = await this.documentRepo.getProjectDocuments(validatedData.projectId);
      
      // Filter by type if specified
      if (validatedData.type) {
        return documents.filter(doc => doc.type === validatedData.type);
      }
      
      return documents;
    }
  }
}