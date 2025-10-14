import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Timer from "./Timer";

export default async function TimerPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  return <Timer userId={session.user.id} />;
}
