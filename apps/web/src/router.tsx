import { createBrowserRouter, Navigate } from "react-router-dom";

import App from '@/App';
import DashboardPage from '@/pages/Dashboard';
import TimerPage from "@/pages/Timer";
import SignIn from "@/pages/SignIn";
import Competitions from "@/pages/Competitions";
import Training from "@/pages/Training";
import SquareOneCubeshape from "@/pages/SquareOneCubeshape";
import ThreeBldTrace from "@/pages/ThreeBldTrace";
import ThreeBldMemo from "@/pages/ThreeBldMemo";
import AlgLists from "@/pages/AlgLists";
import AlgList from "@/pages/AlgList";
import Layout from "@/features/layout/Layout";
import { RedirectIfSignedIn, SessionExpired } from "@/features/layout/RouteGuards";

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
      { path: '/training', element: <Training /> },
      { path: '/training/square1-cubeshape', element: <SquareOneCubeshape /> },
      { path: '/training/square1-csp/*', element: <Navigate to="/training/square1-cubeshape" replace /> },
      { path: '/training/3bld', element: <ThreeBldTrace /> },
      { path: '/training/3bld-memo', element: <ThreeBldMemo /> },
      { path: '/lists', element: <AlgLists /> },
      { path: '/lists/:listId', element: <AlgList /> },
    ]
  },
  // Public read-only view, no sign-in
  { path: '/lists/share/:listId', element: <div className="h-screen bg-background text-foreground font-sans"><AlgList shared /></div> },
  { path: '*', element: <Navigate to="/" replace /> }
])
