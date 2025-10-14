import Link from "next/link"
import { SignOutButton } from "../SignOutButton"

interface UserInfoProps {
  name: string | null;
  email: string | null;
  id: string | null;
  emailVerified: Date | null;
  lastActivityDate: string | null;
}

const UserInfo = ({ name, email, id, emailVerified, lastActivityDate }: UserInfoProps) => {

  return (
    <div>
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <div className="text-center space-y-6">
          <div className="space-y-4 text-left max-w-md mx-auto">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="font-medium text-gray-600">Name:</span>
              <span className="text-gray-900">{name || 'Not provided'}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="font-medium text-gray-600">Email:</span>
              <span className="text-gray-900">{email || 'Not provided'}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="font-medium text-gray-600">User ID:</span>
              <span className="text-gray-900 font-mono text-sm">{id}</span>
            </div>
            {emailVerified && (
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="font-medium text-gray-600">Email Verified:</span>
                <span className="text-green-600">✓ Verified</span>
              </div>
            )}
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="font-medium text-gray-600">Last Activity:</span>
               <span className="text-gray-900">{lastActivityDate}</span>
            </div>
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
    </div>
  )
}

export default UserInfo
