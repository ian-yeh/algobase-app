"use client";

import { createContext, useContext, useState } from "react";
import { UserType } from "@/lib/types/UserTypes";

type UserContextType = {
  user: UserType;
  setUser: React.Dispatch<React.SetStateAction<UserType>>;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};

export function UserProvider({
  value,
  children,
}: {
  value: UserType;
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<UserType>(value);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}
