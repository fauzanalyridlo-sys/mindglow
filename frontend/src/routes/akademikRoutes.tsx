import type { RouteObject } from 'react-router-dom'

import AppLayout from '../layouts/AppLayout'
import AkademikPage from '../pages/AkademikPage'

export const akademikRoutes: RouteObject[] = [
  {
    path: '/akademik',
    element: (
      <AppLayout>
        <AkademikPage />
      </AppLayout>
    ),
  },
]
