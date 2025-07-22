import { db } from "@/lib/db"
import { user } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

async function checkUserRole() {
  try {
    const users = await db.select().from(user)
    
    console.log("All users in database:")
    users.forEach(u => {
      console.log(`- ${u.email}: role = ${u.role || 'NOT SET'}`)
    })
  } catch (error) {
    console.error("Error checking users:", error)
  } finally {
    process.exit()
  }
}

checkUserRole()