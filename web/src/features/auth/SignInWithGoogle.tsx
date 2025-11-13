import { UserAuth } from "@/contexts/AuthContext"
import { useNavigate } from "react-router-dom";

const SignInWithGoogle = () => {
  const navigate = useNavigate();
  const { session, signInWithGoogle } = UserAuth();

  const handleSignIn = async() => {
    await signInWithGoogle();
    console.log(session)
  }

  return (
    <div>
      <button onClick={handleSignIn}>
        Sign in with Google
      </button>
    </div>
  )
}

export default SignInWithGoogle
