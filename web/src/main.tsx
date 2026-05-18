import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@/index.css'
import { router } from '@/router.tsx'
import { RouterProvider } from 'react-router-dom'
import { AuthContextProvider } from '@/contexts/AuthContext'
import { ConvexProvider, ConvexReactClient } from 'convex/react'

const convexUrl = import.meta.env.VITE_CONVEX_URL
console.log('🔧 DEBUG: VITE_CONVEX_URL =', convexUrl)
console.log('🔧 DEBUG: import.meta.env =', import.meta.env)

const convex = new ConvexReactClient(convexUrl);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConvexProvider client={convex}>
      <AuthContextProvider>
        <RouterProvider router={router} />
      </AuthContextProvider>
    </ConvexProvider>
  </StrictMode>,
)
