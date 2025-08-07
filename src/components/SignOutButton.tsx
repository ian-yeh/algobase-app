"use client"
import { logout } from "@/lib/actions/auth"
export const SignOutButton = () => {
  return (
    <button className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600" onClick={() => logout()}>Sign Out</button>
  )
}
