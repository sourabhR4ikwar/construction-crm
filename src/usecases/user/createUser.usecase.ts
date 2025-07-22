import { UserRepository, CreateUserInput } from "@/repo/user/user.repo"
import { z } from "zod"

export const createUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  role: z.enum(["admin", "staff", "readonly"]),
})

export type CreateUserData = z.infer<typeof createUserSchema>

export class CreateUserUsecase {
  constructor(private userRepo: UserRepository) {}

  async execute(data: CreateUserData) {
    // Validate input
    const validatedData = createUserSchema.parse(data)
    
    // Check if user already exists
    const existingUser = await this.userRepo.findByEmail(validatedData.email)
    if (existingUser) {
      throw new Error("User with this email already exists")
    }

    // Create user
    return await this.userRepo.create(validatedData)
  }
}