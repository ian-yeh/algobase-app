import { auth } from "@/auth";
import { SignOutButton } from "@/components/SignOutButton";
import Image from "next/image";

const page = async () => {
  const session = await auth();
  console.log(session);

  return (
      <div className="flex flex-col justify-center items-center h-screen">
        <h1>Welcome to the page!</h1>
        <p>User signed in with name: {session?.user?.name}</p>
        <p>User signed in with name: {session?.user?.email}</p>
        {session?.user?.image && 
          <Image 
            src={session.user.image}
            width={40}
            height={40}
            className="rounded-full"
            alt={session.user.name ?? "Avatar"}
          />
        }

        <SignOutButton />
      </div>
  )
}

export default page
