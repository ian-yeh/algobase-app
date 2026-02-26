import SignInWithGoogle from "@/features/auth/SignInWithGoogle"
import { useNavigate } from "react-router-dom"
import Logo from "@/components/Logo"

const SignIn = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-purple-100 flex flex-col">
      {/* Shared Header */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto w-full">
        <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate("/")}>
          <Logo className="text-xl font-medium" />
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-8 pt-20">
        <div className="max-w-md w-full text-center">
          <h1 className="text-4xl md:text-5xl font-serif font-medium mb-4 tracking-tight">
            Welcome to Algobase
          </h1>
          <p className="text-foreground/60 mb-10 font-medium">
            Join thousands of cubers improving their solves every day.
          </p>

          <div className="bg-slate-50 border border-foreground/5 p-8 rounded-2xl shadow-sm">
            <SignInWithGoogle />
          </div>

          <p className="mt-8 text-xs text-foreground/40 px-10 leading-relaxed">
            By signing in, you agree to our <a href="#" className="underline">Terms of Service</a> and <a href="#" className="underline">Privacy Policy</a>.
          </p>
        </div>
      </main>

      <footer className="py-8 text-center text-xs text-foreground/20">
        © 2026 Algobase Inc.
      </footer>
    </div>
  )
}

export default SignIn
