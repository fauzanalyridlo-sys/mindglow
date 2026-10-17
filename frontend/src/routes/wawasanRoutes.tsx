import type { RouteObject } from 'react-router-dom'

import AppLayout from '../layouts/AppLayout'
import Wawasan from '../pages/Wawasan'

export const wawasanRoutes: RouteObject[] = [
  {
    path: '/wawasan',
    element: (
      <AppLayout>
        <Wawasan />
      </AppLayout>
    ),
  },
]
