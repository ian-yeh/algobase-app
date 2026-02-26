import { createBrowserRouter, Navigate } from "react-router-dom";

import App from '@/App';
import DashboardPage from '@/pages/Dashboard';
import TimerPage from "@/pages/Timer";
import SignIn from "@/pages/SignIn";
import Layout from "@/features/layout/Layout";

export const router = createBrowserRouter([
  { path: '/', element: <App /> },
  { path: '/signin', element: <SignIn /> },
  {
    element: <Layout />,
    children: [
      { path: '/home', element: <DashboardPage /> },
      { path: '/timer', element: <TimerPage /> },
    ]
  },
  { path: '*', element: <Navigate to="/" replace /> }
])
