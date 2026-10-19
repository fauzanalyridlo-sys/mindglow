import type { RouteObject } from 'react-router-dom'

import { publicRoutes } from './publicRoutes'
import { aiRoutes } from './aiRoutes'
import { reflectionRoutes } from './reflectionRoutes'
import { wawasanRoutes } from './wawasanRoutes'
import { checkinRoutes } from './checkinRoutes'
import { journalRoutes } from './journalRoutes'
import { akademikRoutes } from './akademikRoutes'
import { dashboardRoutes } from './dashboardRoutes'
import { profileRoutes } from './profileRoutes'

export const appRoutes: RouteObject[] = [
  ...publicRoutes,
  ...aiRoutes,
  ...reflectionRoutes,
  ...wawasanRoutes,
  ...checkinRoutes,
  ...journalRoutes,
  ...akademikRoutes,
  ...dashboardRoutes,
  ...profileRoutes,
]