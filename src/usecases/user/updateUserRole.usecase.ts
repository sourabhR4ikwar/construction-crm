import { UserRepository, UserRole } from "@/repo/user/user.repo"
import { z } from "zod"

export const updateUserRoleSchema = z.object({
  role: z.enum(["admin", "staff", "readonly"]),
})

export type UpdateUserRoleData = z.infer<typeof updateUserRoleSchema>

export class UpdateUserRoleUsecase {
  constructor(private userRepo: UserRepository) {}

  async execute(id: string, data: UpdateUserRoleData) {
    // Validate input
    const validatedData = updateUserRoleSchema.parse(data)
    
    // Check if user exists
    const existingUser = await this.userRepo.findById(id)
    if (!existingUser) {
      throw new Error("User not found")
    }

    // Update user role
    return await this.userRepo.updateRole(id, validatedData.role)
  }
}