import type { RouteObject } from 'react-router-dom'

import AppLayout from '../layouts/AppLayout'
import JournalPage from '../pages/JournalPage'

export const journalRoutes: RouteObject[] = [
  {
    path: '/journal',
    element: (
      <AppLayout>
        <JournalPage />
      </AppLayout>
    ),
  },
]
