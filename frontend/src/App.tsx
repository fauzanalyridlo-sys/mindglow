import { BrowserRouter, Routes, Route } from 'react-router-dom'

import PublicLayout from './layouts/PublicLayout'
import AppLayout from './layouts/AppLayout'
import LandingPage from './pages/LandingPage'
import Ai from './pages/Ai'
import AiRuangRefleksi from './pages/AiRuangRefleksi'
import Wawasan from './pages/Wawasan'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Halaman utama */}
        <Route
          path="/"
          element={
            <PublicLayout>
              <LandingPage />
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


          <Route
  path="/wawasan"
  element={
    <AppLayout>
      <Wawasan />
    </AppLayout>
  }
/>
      </Routes>
    </BrowserRouter>
  )
}
