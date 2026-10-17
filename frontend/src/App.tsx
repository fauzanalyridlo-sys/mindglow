import { Routes, Route } from 'react-router-dom'

import PublicLayout from './layouts/PublicLayout'
import AppLayout from './layouts/AppLayout'

import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'

import Ai from './pages/Ai'
import AiRuangRefleksi from './pages/AiRuangRefleksi'
import Wawasan from './pages/Wawasan'

export default function App() {
  return (
    <Routes>
      {/* Halaman publik */}
      <Route
        path="/"
        element={
          <PublicLayout>
            <LandingPage />
          </PublicLayout>
        }
      />

      <Route
        path="/login"
        element={
          <PublicLayout>
            <LoginPage />
          </PublicLayout>
        }
      />

      <Route
        path="/register"
        element={
          <PublicLayout>
            <RegisterPage />
          </PublicLayout>
        }
      />

      {/* Halaman AI */}
      <Route
        path="/ai"
        element={
          <AppLayout>
            <Ai />
          </AppLayout>
        }
      />

      {/* Ruang Refleksi AI */}
      <Route
        path="/reflection"
        element={
          <AppLayout>
            <AiRuangRefleksi />
          </AppLayout>
        }
      />

      {/* Halaman Wawasan */}
      <Route
        path="/wawasan"
        element={
          <AppLayout>
            <Wawasan />
          </AppLayout>
        }
      />
    </Routes>
  )
}