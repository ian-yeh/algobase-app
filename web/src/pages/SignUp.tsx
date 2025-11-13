import { Link } from "react-router-dom"

const SignUp = () => {
  return (
    <div className="flex flex-col items-center justify-center h-[100vh]">
      <div>
        <h1 className="text-3xl font-bold">Sign up for Algobase.</h1>
        <h3>Already have an account? <Link to={"/signin"} className="text-sky-200">Sign in.</Link></h3>
      </div>
    </div>
  )
}

export default SignUp
