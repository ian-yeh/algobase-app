import { NextResponse } from "next/server";
import { db } from "@/database/drizzle";
import { users } from "@/database/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  const body = await req.json();
  const { id, name } = body;

  await db
    .update(users)
    .set({ name })
    .where(eq(users.id, id));

  return NextResponse.json({ success: true });
}
