import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useMutation } from "convex/react"
import { api } from "@convex/_generated/api"
import Logo from "@/components/Logo"
import { useAuthStore } from "@/stores/authStore"

const SignIn = () => {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [username, setUsername] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)
  const signUpMutation = useMutation(api.auth.signUp)
  const signInMutation = useMutation(api.auth.signIn)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const result = isSignUp
        ? await signUpMutation({ email, password, username })
        : await signInMutation({ email, password })
      setAuth(result)
      navigate("/home")
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      if (message.includes("User already exists")) {
        setError("This email is already registered. Try signing in instead.")
      } else if (message.includes("Invalid email or password")) {
        setError("Invalid email or password. Please try again.")
      } else {
        setError(isSignUp ? "Sign up failed. Please try again." : "Sign in failed. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-purple-100 flex flex-col">
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto w-full">
        <div className="flex items-center space-x-2">
          <Link to="/">
            <Logo className="text-xl font-medium cursor-pointer hover:opacity-80 transition-opacity" />
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-8 pt-20">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-serif font-medium mb-4 tracking-tight">
              {isSignUp ? "Join Algobase" : "Welcome back"}
            </h1>
            <p className="text-foreground/60 font-medium">
              {isSignUp
                ? "Create an account to track your solves"
                : "Sign in to your account"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="bg-slate-50 border border-foreground/5 p-8 rounded-2xl shadow-sm space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm font-medium">
                <p className="flex items-center gap-2">
                  <span>⚠️</span>
                  {error}
                </p>
              </div>
            )}

            {isSignUp && (
              <div>
                <label className="block text-sm font-medium mb-2">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="speedcuber123"
                  className="w-full px-3 py-2 border border-foreground/10 rounded-lg focus:outline-none focus:border-foreground/30"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-3 py-2 border border-foreground/10 rounded-lg focus:outline-none focus:border-foreground/30"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 border border-foreground/10 rounded-lg focus:outline-none focus:border-foreground/30"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 px-4 py-2 bg-foreground text-background font-medium rounded-lg hover:opacity-90 transition-all disabled:opacity-50"
            >
              {loading ? "Loading..." : isSignUp ? "Create account" : "Sign in"}
            </button>
          </form>

          <p className="text-center mt-6 text-sm">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              onClick={() => {
                setIsSignUp(!isSignUp)
                setError("")
              }}
              className="underline font-medium hover:opacity-70"
            >
              {isSignUp ? "Sign in" : "Sign up"}
            </button>
          </p>

          <p className="mt-8 text-xs text-foreground/40 px-10 leading-relaxed text-center">
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
