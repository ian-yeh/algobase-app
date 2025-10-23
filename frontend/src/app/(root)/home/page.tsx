"use client"
import { auth } from "@/auth"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
//import { DataTable } from "@/components/data-table"
import { SectionCards } from "@/components/section-cards"
import { redirect } from "next/navigation";

import { times } from "@/database/schema"; // your table definition
import { eq } from "drizzle-orm";
import { db } from "@/database/drizzle";


export default async function Page() {
  let solves = [];
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  //const solves = await db
  //  .select()
  //  .from(times)
  //  .where(eq(times.userId, session.user.id))
  //  .orderBy(times.createdAt);

  try {
    const response = await fetch('/api/solve');
    console.log("response:", response);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    solves = result.data;

    // Use solves here
    console.log("solves:", solves);

  } catch (error) {
    console.error("Failed to fetch solves:", error);
    // Handle error appropriately (show user message, etc.)
  }
  
  return (
    <div className="@container/main flex flex-1 flex-col gap-2">
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <SectionCards 
          solves={solves}
        />
        <div className="px-4 lg:px-6">
          <ChartAreaInteractive 
            solves={solves}
          />
        </div>
        {/*
        <DataTable data={data} />
        */}
      </div>
    </div>
  )
}
