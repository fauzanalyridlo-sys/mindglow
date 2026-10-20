import type { RouteObject } from 'react-router-dom'

import PublicLayout from '../layouts/PublicLayout'

import LandingPage from '../pages/LandingPage'
import LoginPage from '../pages/LoginPage'
import RegisterPage from '../pages/RegisterPage'
import KonfirmasiEmailPage from '../pages/KonfirmasiEmailPage'
import BuatKataSandiBaruPage from '../pages/BuatKataSandiBaruPage'

export const publicRoutes: RouteObject[] = [
  {
    path: '/',
    element: (
      <PublicLayout>
        <LandingPage />
      </PublicLayout>
    ),
  },
  {
    path: '/login',
    element: (
      <PublicLayout>
        <LoginPage />
      </PublicLayout>
    ),
  },
  {
    path: '/forgot-password',
    element: (
      <PublicLayout>
        <KonfirmasiEmailPage />
      </PublicLayout>
    ),
  },
  {
    path: '/reset-password',
    element: (
      <PublicLayout>
        <BuatKataSandiBaruPage />
      </PublicLayout>
    ),
  },
  {
    path: '/register',
    element: (
      <PublicLayout>
        <RegisterPage />
      </PublicLayout>
    ),
  },
]
