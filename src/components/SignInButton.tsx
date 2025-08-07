"use client"
import { login } from "@/lib/actions/auth"
export const SignInButton = () => {
  return (
    <button className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600" onClick={() => login("github")}>Sign in with Github</button>
  )
}
