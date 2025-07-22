import { auth } from "@/lib/auth"

async function checkSession() {
  try {
    // This simulates what would happen with headers
    const session = await auth.api.getSession({
      headers: new Headers({
        'cookie': '' // Empty cookie for testing
      })
    })
    
    console.log("Session structure:")
    console.log(JSON.stringify(session, null, 2))
  } catch (error) {
    console.error("Error checking session:", error)
  } finally {
    process.exit()
  }
}

checkSession()