import SignInWithGoogle from "@/features/auth/SignInWithGoogle"
//import { Link } from "react-router-dom"

const SignIn = () => {
  return (
    <div className="flex flex-col items-center justify-center h-[100vh]">
      <div>
        <h1 className="text-3xl font-bold">Sign up today!</h1>
        <SignInWithGoogle />
      </div>
    </div>
  )
}

export default SignIn
