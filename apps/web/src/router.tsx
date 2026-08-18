import { createBrowserRouter, Navigate, useRouteError } from "react-router-dom";

import App from '@/App';
import DashboardPage from '@/pages/Dashboard';
import TimerPage from "@/pages/Timer";
import SignIn from "@/pages/SignIn";
import Competitions from "@/pages/Competitions";
import Layout from "@/features/layout/Layout";
import { useAuthStore } from "@/stores/authStore";

const RedirectIfSignedIn = ({ children }: { children: React.ReactNode }) => {
  const token = useAuthStore((s) => s.token);
  return token ? <Navigate to="/home" replace /> : <>{children}</>;
};

// A stale/expired token makes every protected query throw "Invalid token".
// Sign the user out so they land on /signin instead of the crash screen.
const SessionExpired = () => {
  const error = useRouteError();
  if (!String((error as Error)?.message ?? error).includes("Invalid token")) throw error;
  useAuthStore.getState().clearAuth();
  return <Navigate to="/signin" replace />;
};

export const router = createBrowserRouter([
  { path: '/', element: <RedirectIfSignedIn><App /></RedirectIfSignedIn> },
  { path: '/signin', element: <RedirectIfSignedIn><SignIn /></RedirectIfSignedIn> },
  {
    element: <Layout />,
    errorElement: <SessionExpired />,
    children: [
      { path: '/home', element: <DashboardPage /> },
      { path: '/timer', element: <TimerPage /> },
      { path: '/competitions', element: <Competitions /> },
    ]
  },
  { path: '*', element: <Navigate to="/" replace /> }
])
