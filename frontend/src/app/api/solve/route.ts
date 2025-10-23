import { NextResponse } from "next/server";
//import { db } from "@/database/drizzle";
//import { times } from "@/database/schema"; // Make sure to import times table
import { auth } from "@/auth";
import { getCurrentUser } from "@/lib/data/users";

// for adding times to the times table
export async function POST(req: Request) {
 const session = await auth();
 if (!session?.user?.id) {
   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
 }
 
 const user = await getCurrentUser(session.user.id);
 if (!user) {
   return NextResponse.json({ error: "User not found" }, { status: 404 });
 }

 try {
   // Parse request body
   const body = await req.json();
   const { time, scramble, dnf = false } = body;

   // Validate required fields
   if (!time || !scramble) {
     return NextResponse.json(
       { error: "Time and scramble are required" }, 
       { status: 400 }
     );
   }

   // Convert time to centiseconds and validate
   const timeInCentiseconds = Math.round(time * 100);
   if (timeInCentiseconds <= 0) {
     return NextResponse.json(
       { error: "Time must be greater than 0" }, 
       { status: 400 }
     );
   }

   // Save to database
   const response = await fetch(`http://127.0.0.1/8000/solve`, {
     method: 'POST',
     headers: {
       'Content-Type': 'application/json',
     },
     body: JSON.stringify({
       userId: user.id,
       time: timeInCentiseconds,
       scramble,
       dnf,
     })
   });

   const data = await response.json();

   // Return the saved time (convert back to seconds for response)
   return NextResponse.json({
     success: true,
     data: {
       timeInSeconds: data.time / 100
     }
   }, { status: 201 });

 } catch (error) {
   console.error("Error saving solve:", error);
   return NextResponse.json(
     { error: "Failed to save solve" }, 
     { status: 500 }
   );
 }
}

// for getting all the solves for a user
export async function GET() {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }   
    const user = await getCurrentUser(session.user.id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    try {
      const response = await fetch(`http://127.0.0.1/8000/solve?user_id=${user.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
  
      const data = await response.json();
  
      return NextResponse.json({
        success: true,
        data: data.solves.map((solve: any) => ({
          ...solve,
          timeInSeconds: solve.time / 100
        }))
      }, { status: 200 });
  
    } catch (error) {
      console.error("Error fetching solves:", error);
      return NextResponse.json(
        { error: "Failed to fetch solves" }, 
        { status: 500 }
      );
    }
}
