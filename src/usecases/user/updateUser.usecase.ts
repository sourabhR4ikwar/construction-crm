import { UserRepository, UpdateUserInput } from "@/repo/user/user.repo"
import { z } from "zod"

export const updateUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  email: z.string().email("Invalid email address").optional(),
  role: z.enum(["admin", "staff", "readonly"]).optional(),
})

export type UpdateUserData = z.infer<typeof updateUserSchema>

export class UpdateUserUsecase {
  constructor(private userRepo: UserRepository) {}

  async execute(id: string, data: UpdateUserData) {
    // Validate input
    const validatedData = updateUserSchema.parse(data)
    
    // Check if user exists
    const existingUser = await this.userRepo.findById(id)
    if (!existingUser) {
      throw new Error("User not found")
    }

    // Check if email is already taken by another user
    if (validatedData.email) {
      const userWithEmail = await this.userRepo.findByEmail(validatedData.email)
      if (userWithEmail && userWithEmail.id !== id) {
        throw new Error("Email already taken by another user")
      }
    }

    // Update user
    return await this.userRepo.update(id, validatedData)
  }
}