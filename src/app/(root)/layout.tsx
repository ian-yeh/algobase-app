import { ReactNode } from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { after } from "next/server";
import { db } from "@/database/drizzle";
import { users } from "@/database/schema";
import { eq } from "drizzle-orm";
import { Sidebar } from "@/components/Sidebar";
import Header from "@/components/Header";
import { getCurrentUser } from "@/lib/data/users";
import { UserProvider } from "@/components/providers/UserProvider";

const Layout = async ({ children }: { children: ReactNode }) => {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const user = await getCurrentUser(session.user.id);
  if (!user) return <div>User does not exist</div>;

  // updating the user's activity date
  after(async () => {
    if (!session?.user?.id) return;
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, session?.user?.id))
      .limit(1);
    if (user[0].lastActivityDate === new Date().toISOString().slice(0, 10))
      return;
    await db
    .update(users)
    .set({ lastActivityDate: new Date().toISOString().slice(0, 10) })
    .where(eq(users.id, session?.user?.id));
  });

  return (
    <div className="flex flex-col h-screen bg-background">
      <UserProvider value={user}>
        {/* Header */}
        <Header 
          userAvatar={user?.image || session.user.image || undefined}
          userName={user?.name || session.user.name || undefined}
          userEmail={user?.email || session.user.email || undefined}
        />

        {/* Main layout with sidebar */}
        <div className="flex flex-1">
          {/* Sidebar */}
          <div className="w-[250px] h-full">
            <Sidebar />
          </div>

          {/* Main content area */}
          <main className="flex-1 h-full">
            {children}
          </main>
        </div>

      </UserProvider>
    </div>
  );
};

export default Layout;
