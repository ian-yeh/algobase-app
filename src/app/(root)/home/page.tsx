import { auth } from "@/auth";
import Header from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { getCurrentUser } from "@/lib/data/users";
import UserInfo from "@/components/dashboard/UserInfo";

const page = async () => {
  const session = await auth();
  if (!session?.user?.id) return <div>Please sign in</div>;

  const user = await getCurrentUser(session.user.id)
  if (!user) return <div>User does not exist</div>

  return (
    <div className="flex flex-col font-sans bg-gray-50 min-h-screen">
      <div className="">
        <Header 
          userAvatar={user?.image || session.user.image || undefined}
          userName={user?.name || session.user.name || undefined}
          userEmail={user?.email || session.user.email || undefined}
        />
      </div>
      
      {/* Main content with fixed sidebar width */}
      <main className="flex flex-1">

        <div className="w-[250px]">
          <Sidebar />
        </div>

        <div className="flex flex-col flex-1 p-6 gap-4">

          <div className="">
            <UserInfo 
              name={user.name}
              email={user.email}
              id={user.id}
              emailVerified={user.emailVerified}
              lastActivityDate={user.lastActivityDate}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default page;
