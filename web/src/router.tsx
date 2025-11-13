import { createBrowserRouter } from "react-router-dom";

import App from '@/App';
import HomePage from '@/pages/Home';
import SignIn from "@/pages/SignIn";
import SignUp from "@/pages/SignUp";

export const router = createBrowserRouter([
  { path: '/', element: <App /> },
  { path: '/home', element: <HomePage /> },
  { path: '/signin', element: <SignIn /> },
  { path: '/signup', element: <SignUp /> },
])
