import type { RouteObject } from 'react-router-dom'
import AppLayout from '../layouts/AppLayout'
import ProfilePage from '../pages/ProfilePage'

export const profileRoutes: RouteObject[] = [
  {
    path: '/profile',
    element: (
      <AppLayout>
        <ProfilePage />
      </AppLayout>
    ),
  },
]
