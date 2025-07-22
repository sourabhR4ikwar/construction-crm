import { db } from "@/lib/db"
import { user } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

async function updateFirstUserToAdmin() {
  try {
    // Get the first user
    const users = await db.select()
      .from(user)
      .limit(1)

    if (users.length === 0) {
      console.log("No users found. Please create a user first through the registration page.")
      return
    }

    const firstUser = users[0]
    
    // Update to admin role
    await db.update(user)
      .set({
        role: "admin",
        updatedAt: new Date(),
      })
      .where(eq(user.id, firstUser.id))

    console.log(`Updated user ${firstUser.email} to admin role`)
  } catch (error) {
    console.error("Error updating user to admin:", error)
  } finally {
    process.exit()
  }
}

updateFirstUserToAdmin()