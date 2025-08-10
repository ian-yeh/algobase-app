import { ReactNode } from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { after } from "next/server";
import { db } from "@/database/drizzle";
import { users } from "@/database/schema";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/data/users";
import { UserProvider } from "@/components/providers/UserProvider";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset } from "@/components/ui/sidebar";
import { SiteHeader } from "@/components/site-header";

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

        <SidebarProvider
          style={
            {
              "--sidebar-width": "calc(var(--spacing) * 72)",
              "--header-height": "calc(var(--spacing) * 12)",
            } as React.CSSProperties
          }
          user={user}
        >
          <AppSidebar variant="inset" />
          <SidebarInset>
            <SiteHeader />
            <div className="flex flex-1 flex-col">
              {children}
            </div>
          </SidebarInset>
        </SidebarProvider>

      </UserProvider>
    </div>
  );
};

export default Layout;
