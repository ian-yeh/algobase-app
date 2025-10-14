"use server";
import { signIn, signOut } from "@/auth";

export const login = async (service: string) => {
  await signIn(service, { redirectTo: "/home" });
}

export const logout = async () => {
  await signOut({ redirectTo: "/sign-in" });
}
