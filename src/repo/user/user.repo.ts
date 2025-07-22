import { db } from "@/lib/db"
import { user as userTable } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { BaseRepository, UserRole } from "../base.repo"
import { User } from "@/lib/auth"
import { v4 as uuidv4 } from 'uuid'

export interface CreateUserInput {
  name: string
  email: string
  password?: string
  role: UserRole
}

export interface UpdateUserInput {
  name?: string
  email?: string
  role?: UserRole
}

export class UserRepository extends BaseRepository {
  async findAll() {
    this.authorize("read")
    
    return await db.select().from(userTable)
  }

  async findById(id: string) {
    this.authorize("read")
    
    const users = await db.select()
      .from(userTable)
      .where(eq(userTable.id, id))
    
    return users[0] || null
  }

  async findByEmail(email: string) {
    this.authorize("read")
    
    const users = await db.select()
      .from(userTable)
      .where(eq(userTable.email, email))
    
    return users[0] || null
  }

  async create(input: CreateUserInput) {
    this.authorize("write")
    
    // Only admins can create admin users
    if (input.role === "admin" && !this.isAdmin()) {
      throw new Error("Unauthorized: Only admins can create admin users")
    }

    const newUser = {
      id: uuidv4(),
      name: input.name,
      email: input.email,
      role: input.role,
      emailVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const [createdUser] = await db.insert(userTable)
      .values(newUser)
      .returning()

    return createdUser
  }

  async update(id: string, input: UpdateUserInput) {
    this.authorize("write")
    
    // Only admins can change roles
    if (input.role && !this.isAdmin()) {
      throw new Error("Unauthorized: Only admins can change user roles")
    }

    // Only admins can create admin users
    if (input.role === "admin" && !this.isAdmin()) {
      throw new Error("Unauthorized: Only admins can assign admin role")
    }

    const [updatedUser] = await db.update(userTable)
      .set({
        ...input,
        updatedAt: new Date(),
      })
      .where(eq(userTable.id, id))
      .returning()

    return updatedUser
  }

  async delete(id: string) {
    this.authorize("delete")
    
    // Prevent deleting yourself
    if (this.user?.id === id) {
      throw new Error("Cannot delete your own account")
    }

    await db.delete(userTable)
      .where(eq(userTable.id, id))
  }

  async updateRole(id: string, role: UserRole) {
    if (!this.isAdmin()) {
      throw new Error("Unauthorized: Only admins can change user roles")
    }

    // Prevent changing your own role
    if (this.user?.id === id) {
      throw new Error("Cannot change your own role")
    }

    const [updatedUser] = await db.update(userTable)
      .set({
        role,
        updatedAt: new Date(),
      })
      .where(eq(userTable.id, id))
      .returning()

    return updatedUser
  }
}