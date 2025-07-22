import { UserRepository } from "@/repo/user/user.repo"

export class ListUsersUsecase {
  constructor(private userRepo: UserRepository) {}

  async execute() {
    return await this.userRepo.findAll()
  }
}