import { SignInWithGithub } from "@/components/SignInWithGithub"
import Logo from "@/components/Logo"
import { SignInWithGoogle } from "@/components/SignInWithGoogle"

const Page = () => {
  return (
    <div className="min-h-screen font-sans">
      {/* Left side - Sign in form */}
      <div className="flex flex-col justify-center items-center bg-white">
        <div className="h-[10vh] flex flex-col justify-center w-full px-8">
          <div className="flex items-center space-x-2">
            <Logo />
            <span className="text-xl font-semibold">Algobase</span>
          </div>
        </div>

        {/* Sign in form - fixed width container */}
        <div className="h-[80vh] w-full max-w-[400px] justify-center items-center flex flex-col px-8">
          <h1 className="text-2xl font-semibold text-black mb-2 w-full tracking-tight">Create it. Analyze it.</h1>
          <p className="text-2xl font-semibold text-gray-300 mb-12 w-full tracking-tight">Log in to Algobase.</p>

          <div className="w-full space-y-2">
            <SignInWithGoogle />
            <SignInWithGithub />
          </div>

          <div className="mt-8">
            <p className="text-xs text-gray-600">By continuing, you are agreeing to our Terms and Conditions and Privacy Policy.</p>
          </div>

        </div>

        <div className="h-[10vh]"></div>
      </div>
      
    </div>
  )
}

export default Page
