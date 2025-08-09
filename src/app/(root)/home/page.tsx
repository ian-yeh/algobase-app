"use client";
import { useUser } from "@/components/providers/UserProvider";

const HomePage = () => {
  const { user } = useUser();
  if (!user) return <div>Please log in</div>
  console.log(user.name)
  
  return (
    <div className="flex flex-col font-sans bg-background min-h-screen">
      
      {/* Main content with fixed sidebar width */}
      <main className="flex flex-1">
        <div className="flex flex-col flex-1">
          <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-4 gap-4 p-4">
            <div className="bg-card text-card-foreground p-4 rounded-lg xl:col-span-2 border border-border">Chart</div>
            <div className="bg-card text-card-foreground p-4 rounded-lg border border-border">Chart</div>
            <div className="bg-card text-card-foreground p-4 rounded-lg border border-border">Chart</div>
            <div className="bg-card text-card-foreground p-4 rounded-lg border border-border">Chart</div>
            <div className="bg-card text-card-foreground p-4 rounded-lg border border-border">Chart</div>
            <div className="bg-card text-card-foreground p-4 rounded-lg xl:col-span-2 border border-border">Chart</div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HomePage;
