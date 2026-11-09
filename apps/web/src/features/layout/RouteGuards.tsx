import { Navigate, useRouteError } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";

export const RedirectIfSignedIn = ({ children }: { children: React.ReactNode }) => {
  const token = useAuthStore((s) => s.token);
  return token ? <Navigate to="/home" replace /> : <>{children}</>;
};

// A stale/expired token makes every protected query throw "Invalid token".
// Sign the user out so they land on /signin instead of the crash screen.
export const SessionExpired = () => {
  const error = useRouteError();
  if (!String((error as Error)?.message ?? error).includes("Invalid token")) throw error;
  useAuthStore.getState().clearAuth();
  return <Navigate to="/signin" replace />;
};
