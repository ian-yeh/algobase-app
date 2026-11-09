import { useState, type SyntheticEvent } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useMutation } from "convex/react"
import { api } from "@convex/_generated/api"
import Logo from "@/components/Logo"
import { useAuthStore } from "@/stores/authStore"
import { generateScramble } from "@/lib/scramble"

const SignIn = () => {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [username, setUsername] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [scramble] = useState(generateScramble)

  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)
  const signUpMutation = useMutation(api.auth.signUp)
  const signInMutation = useMutation(api.auth.signIn)

  const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const result = isSignUp
        ? await signUpMutation({ email, password, username })
        : await signInMutation({ email, password })
      setAuth(result)
      navigate("/timer")
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

  const inputClass =
    "w-full h-10 px-3 bg-background border border-line rounded-md text-sm placeholder:text-foreground/30 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
  const focusRing =
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="w-full max-w-6xl mx-auto px-4 sm:px-8 h-16 flex items-center border-b border-line">
        <Link to="/" className={`rounded-sm hover:opacity-70 transition-opacity ${focusRing}`}>
          <Logo className="text-lg" />
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <h1 className="text-3xl sm:text-4xl font-serif font-medium tracking-tight">
            {isSignUp ? "Create your account" : "Sign in to Algobase"}
          </h1>
          <p className="mt-2 text-sm text-foreground/60">
            {isSignUp
              ? "Your solves, stats, and alg lists are saved to this account."
              : "Pick up where you left off."}
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4" aria-busy={loading}>
            {isSignUp && (
              <div>
                <label htmlFor="username" className="block text-sm font-medium mb-1.5">Username</label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="speedcuber123"
                  className={inputClass}
                  required
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1.5">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className={inputClass}
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1.5">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete={isSignUp ? "new-password" : "current-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
                required
              />
            </div>

            {error && (
              <p role="alert" className="text-sm text-red-700 dark:text-red-400 border-l-2 border-red-600 dark:border-red-400 pl-3">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full h-10 px-4 bg-foreground text-background text-sm font-medium rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 ${focusRing}`}
            >
              {loading
                ? isSignUp ? "Creating account..." : "Signing in..."
                : isSignUp ? "Create account" : "Sign in"}
            </button>
          </form>

          <p className="mt-6 pt-6 border-t border-line text-sm text-foreground/60">
            {isSignUp ? "Already have an account?" : "New to Algobase?"}{" "}
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp)
                setError("")
              }}
              className={`text-foreground font-medium underline underline-offset-4 decoration-foreground/30 hover:decoration-foreground rounded-sm ${focusRing}`}
            >
              {isSignUp ? "Sign in" : "Create account"}
            </button>
          </p>
        </div>
      </main>

      <footer className="w-full max-w-6xl mx-auto px-4 sm:px-8 py-6 border-t border-line">
        <p aria-hidden="true" className="font-mono text-xs text-foreground/35 break-words">
          {scramble}
        </p>
      </footer>
    </div>
  )
}

export default SignIn
