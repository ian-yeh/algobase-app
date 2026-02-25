import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

const SignInWithGoogle = () => {
  const navigate = useNavigate();
  const { session, signInWithGoogle } = useAuth();

  const handleSignIn = async() => {
    await signInWithGoogle();
    navigate("/");
    console.log(session);
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
