import type { RouteObject } from 'react-router-dom'

import AppLayout from '../layouts/AppLayout'
import AiRuangRefleksi from '../pages/AiRuangRefleksi'

export const reflectionRoutes: RouteObject[] = [
  {
    path: '/reflection',
    element: (
      <AppLayout>
        <AiRuangRefleksi />
      </AppLayout>
    ),
  },
]
