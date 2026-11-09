import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import Loading from "@/components/Loading";

import App from '@/App';
import { RedirectIfSignedIn, SessionExpired } from "@/features/layout/RouteGuards";

// Only the landing page ships in the entry chunk; every other route loads on demand.
const page = (load: () => Promise<{ default: React.ComponentType<object> }>) => {
  const Page = lazy(load);
  return <Suspense fallback={<Loading />}><Page /></Suspense>;
};
const AlgList = lazy(() => import("@/pages/AlgList"));
const Layout = lazy(() => import("@/features/layout/Layout"));

export const router = createBrowserRouter([
  { path: '/', element: <RedirectIfSignedIn><App /></RedirectIfSignedIn> },
  { path: '/signin', element: <RedirectIfSignedIn>{page(() => import("@/pages/SignIn"))}</RedirectIfSignedIn> },
  {
    element: <Suspense fallback={<Loading />}><Layout /></Suspense>,
    errorElement: <SessionExpired />,
    children: [
      { path: '/home', element: page(() => import("@/pages/Dashboard")) },
      { path: '/timer', element: page(() => import("@/pages/Timer")) },
      { path: '/competitions', element: page(() => import("@/pages/Competitions")) },
      { path: '/training', element: page(() => import("@/pages/Training")) },
      { path: '/training/square1-cubeshape', element: page(() => import("@/pages/SquareOneCubeshape")) },
      { path: '/training/square1-csp/*', element: <Navigate to="/training/square1-cubeshape" replace /> },
      { path: '/training/3bld', element: page(() => import("@/pages/ThreeBldTrace")) },
      { path: '/training/3bld-memo', element: page(() => import("@/pages/ThreeBldMemo")) },
      { path: '/lists', element: page(() => import("@/pages/AlgLists")) },
      { path: '/lists/:listId', element: <Suspense fallback={<Loading />}><AlgList /></Suspense> },
    ]
  },
  // Public read-only view, no sign-in
  { path: '/lists/share/:listId', element: <div className="h-screen bg-background text-foreground font-sans"><Suspense fallback={<Loading />}><AlgList shared /></Suspense></div> },
  { path: '*', element: <Navigate to="/" replace /> }
])
