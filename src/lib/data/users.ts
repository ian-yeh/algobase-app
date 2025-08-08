import { db } from "@/database/drizzle";
import { users } from "@/database/schema";
import { eq } from "drizzle-orm";

export async function getCurrentUser(userId: string) {
  try {
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    
    return user[0] || null;
  } catch (error) {
    console.error('Failed to fetch user:', error);
    return null;
  }
}
