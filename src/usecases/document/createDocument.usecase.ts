import { DocumentRepository, CreateDocumentData } from "@/repo/document/document.repo";
import { z } from "zod";

export const createDocumentSchema = z.object({
  projectId: z.string().min(1, "Project ID is required"),
  name: z.string().min(1, "Document name is required").max(255, "Name must be 255 characters or less"),
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
  ]),
  accessLevel: z.enum(["public", "project_members", "admin_only"]).optional(),
  tags: z.array(z.string()).optional(),
});

export type CreateDocumentInput = z.infer<typeof createDocumentSchema>;

export class CreateDocumentUsecase {
  constructor(private documentRepo: DocumentRepository) {}

  async execute(data: CreateDocumentInput) {
    const validatedData = createDocumentSchema.parse(data);
    
    const document = await this.documentRepo.createDocument(validatedData);
    
    return document;
  }
}