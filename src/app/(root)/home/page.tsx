import { auth } from "@/auth";
import { SignOutButton } from "@/components/SignOutButton";
import Header from "@/components/Header";
import Link from "next/link";
import { db } from "@/database/drizzle";
import { users } from "@/database/schema";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/data/users";

const page = async () => {
  const session = await auth();
  
  if (!session?.user?.id) {
    return <div>Please sign in</div>;
  }

  const user = await getCurrentUser(session.user.id)

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        userAvatar={user?.image || session.user.image || undefined}
        userName={user?.name || session.user.name || undefined}
      />
      
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="text-center space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Welcome to your dashboard
            </h2>
            
            <div className="space-y-4 text-left max-w-md mx-auto">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="font-medium text-gray-600">Name:</span>
                <span className="text-gray-900">{user?.name || 'Not provided'}</span>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="font-medium text-gray-600">Email:</span>
                <span className="text-gray-900">{user?.email || 'Not provided'}</span>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="font-medium text-gray-600">User ID:</span>
                <span className="text-gray-900 font-mono text-sm">{user?.id}</span>
              </div>
              
              {user?.emailVerified && (
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="font-medium text-gray-600">Email Verified:</span>
                  <span className="text-green-600">✓ Verified</span>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
              <Link href="/prompt">
                <button className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
                  Start Prompting
                </button>
              </Link>
              
              <SignOutButton />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default page;
