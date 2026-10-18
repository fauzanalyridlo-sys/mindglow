import type { RouteObject } from 'react-router-dom'
import AppLayout from '../layouts/AppLayout'
import RelaksasiPage from '../pages/RelaksasiPage'

export const relaksasiRoutes: RouteObject[] = [
  {
    path: '/relaksasi',
    element: (
      <AppLayout>
        <RelaksasiPage />
      </AppLayout>
    ),
  },
]