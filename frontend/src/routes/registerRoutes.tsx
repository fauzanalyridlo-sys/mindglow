import type { RouteObject } from 'react-router-dom';
import RegisterPage from '../pages/RegisterPage'; 

export const daftarRoutes: RouteObject[] = [
  {
    path: '/register', // Alamat URL untuk halaman pendaftaran
    element: <RegisterPage />, // TANPA AppLayout, sesuai desain awal
  },
];
