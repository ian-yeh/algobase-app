import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@/index.css'
import { router } from '@/router.tsx'
import { RouterProvider } from 'react-router-dom'
import { ConvexProvider, ConvexReactClient } from 'convex/react'

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConvexProvider client={convex}>
      <RouterProvider router={router} />
    </ConvexProvider>
  </StrictMode>,
)
