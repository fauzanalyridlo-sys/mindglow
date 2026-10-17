import type { RouteObject } from 'react-router-dom'

import AppLayout from '../layouts/AppLayout'
import Ai from '../pages/Ai'

export const aiRoutes: RouteObject[] = [
  {
    path: '/ai',
    element: (
      <AppLayout>
        <Ai />
      </AppLayout>
    ),
  },
]