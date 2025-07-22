import { UserRepository } from "@/repo/user/user.repo"

export class DeleteUserUsecase {
  constructor(private userRepo: UserRepository) {}

  async execute(id: string) {
    // Check if user exists
    const existingUser = await this.userRepo.findById(id)
    if (!existingUser) {
      throw new Error("User not found")
    }

    // Delete user
    await this.userRepo.delete(id)
    return { success: true, message: "User deleted successfully" }
  }
}