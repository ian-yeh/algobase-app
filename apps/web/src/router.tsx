import { createBrowserRouter, Navigate } from "react-router-dom";

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

export const router = createBrowserRouter([
  { path: '/', element: <RedirectIfSignedIn><App /></RedirectIfSignedIn> },
  { path: '/signin', element: <RedirectIfSignedIn><SignIn /></RedirectIfSignedIn> },
  {
    element: <Layout />,
    children: [
      { path: '/home', element: <DashboardPage /> },
      { path: '/timer', element: <TimerPage /> },
      { path: '/competitions', element: <Competitions /> },
    ]
  },
  { path: '*', element: <Navigate to="/" replace /> }
])
