import type { RouteObject } from 'react-router-dom';
import ProfilePage from '../pages/ProfilePage';

// Mengimpor AppNavbar dari folder 'layout' sesuai struktur folder Anda
import AppNavbar from '../components/layout/AppNavbar';

export const profileRoutes: RouteObject[] = [
  {
    path: '/profile',
    element: (
      <>
        <AppNavbar />
        <ProfilePage />
      </>
    ),
  },
];