'use client'

import '../styles/dashboard.css'
import { useRouter } from 'next/navigation'

const DashboardPage = () => {
  const router = useRouter();

  return (
    <main className="dashboard-container">
      
      {/* --- BANNER SELAMAT DATANG --- */}
      <section className="welcome-banner">
        <h1>Selamat Datang Kembali, Lambang_seto 👋</h1>
        <p>
          Ingat, kamu tidak perlu menyelesaikan semua masalah sekaligus. 
          Cukup ambil satu langkah kecil hari ini.
        </p>
        <div className="banner-buttons">
          
          <button 
            className="btn-glass" 
            onClick={() => router.push('/checkin')}
          >
            Check hari ini
          </button>
          
          <button 
            className="btn-glass" 
            onClick={() => router.push('/relaksasi')}
          >
            🫀 Butuh Relaksasi Cepat
          </button>

        </div>
      </section>

      {/* --- KOTAK INFO (GRID) --- */}
      <section className="stats-grid">
        
        {/* Kotak 1: Suasana Hati */}
        <div className="stat-card">
          <div className="icon-circle">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
              <line x1="9" y1="9" x2="9.01" y2="9"></line>
              <line x1="15" y1="9" x2="15.01" y2="9"></line>
            </svg>
          </div>
          <div className="stat-content">
            <p className="stat-title">Suasana Hati Hari Ini</p>
            <h3 className="stat-value">Cukup Lelah / Kewalahan</h3>
            <p className="stat-subtext">Tidur: 6 jam &bull; Energi: 3/5</p>
          </div>
        </div>

        {/* Kotak 2: Tugas Mendatang */}
        <div className="stat-card">
          <div className="icon-circle">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 8 14"></polyline>
            </svg>
          </div>
          <div className="stat-content">
            <p className="stat-title">Tugas Mendatang</p>
            <h3 className="stat-value">Cukup Lelah / Kewalahan</h3>
            <p className="stat-subtext text-red">1 Proyek Kelompok</p>
          </div>
        </div>

        {/* Kotak 3: Ruang Curhat AI */}
        <div className="stat-card">
          <div className="icon-circle">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
          </div>
          <div className="stat-content">
            <p className="stat-title">Ruang Curhat AI</p>
            <h3 className="stat-value">Siap Mendengarkan</h3>
            <a href="/ai" className="stat-subtext text-blue">Mulai Chat &rarr;</a>
          </div>
        </div>

      </section>

      {/* --- BAGIAN TUGAS PRIORITAS --- */}
      <section className="tasks-section">
        <div className="tasks-header">
          <h2>Tugas Prioritas Akademik</h2>
          <a href="/akademik" className="link-all">Kelola Semua Tasks &rarr;</a>
        </div>
        
        <div className="tasks-list">
          <label className="task-item">
            <input type="checkbox" className="task-checkbox" />
            <span className="task-name">Makalah Proyek Sistem Web</span>
            <span className="task-date">25 - 10 - 2026</span>
          </label>

          <label className="task-item">
            <input type="checkbox" className="task-checkbox" />
            <span className="task-name">Ujian Tengah Semester Praktikum</span>
            <span className="task-date">26 - 10 - 2026</span>
          </label>
        </div>
      </section>

    </main>
  );
};

export default DashboardPage;