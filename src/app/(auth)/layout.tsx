import { ReactNode } from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

const Layout = async ({ children }: { children: ReactNode }) => {
  const session = await auth();

  if (session) redirect("/home");

  return (
    <main className="">
      <div>{children}</div>
    </main>
  );
};

export default Layout;
