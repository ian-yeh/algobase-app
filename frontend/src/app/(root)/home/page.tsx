import { auth } from "@/auth"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
//import { DataTable } from "@/components/data-table"
import { SectionCards } from "@/components/section-cards"
import { redirect } from "next/navigation";

import { times } from "@/database/schema"; // your table definition
import { eq } from "drizzle-orm";
import { db } from "@/database/drizzle";


export default async function Page() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const solves = await db
    .select()
    .from(times)
    .where(eq(times.userId, session.user.id))
    .orderBy(times.createdAt);

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
