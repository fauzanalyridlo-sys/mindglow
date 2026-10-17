import type { RouteObject } from 'react-router-dom'

import AppLayout from '../layouts/AppLayout'
import CheckinPage from '../pages/CheckinPage'

export const checkinRoutes: RouteObject[] = [
  {
    path: '/checkin',
    element: (
      <AppLayout>
        <CheckinPage />
      </AppLayout>
    ),
  },
]
