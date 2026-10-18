import type { RouteObject } from 'react-router-dom'

import AppLayout from '../layouts/AppLayout'
import DashboardPage from '../pages/DashboardPage'

export const dashboardRoutes: RouteObject[] = [
  {
    path: '/dashboard',
    element: (
      <AppLayout>
        <DashboardPage />
      </AppLayout>
    ),
  },
]
