import '../styles/daftar.css'
import { useState } from 'react';

const DaftarPage = () => {
  // Membuat "saklar" untuk menampilkan/menyembunyikan notifikasi
  const [showNotif, setShowNotif] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); 
    
    // Menyalakan saklar notifikasi
    setShowNotif(true);

    // MENGOSONGKAN SEMUA KOTAK ISIAN DATA DIRI
    e.currentTarget.reset();

    // Notifikasi akan otomatis tertutup sendiri setelah 3 detik
    setTimeout(() => {
      setShowNotif(false);
    }, 3000);
  };

  // Fungsi untuk tombol "Tutup" pada notifikasi
  const closeNotif = () => {
    setShowNotif(false);
  };

  return (
    <main className="daftar-page-container">
      
      {/* --- KOTAK NOTIFIKASI KUSTOM (Hanya muncul jika showNotif = true) --- */}
      {showNotif && (
        <div className="notif-overlay">
          <div className="notif-box">
            <div className="notif-icon">✅</div>
            <h3>Pendaftaran Berhasil</h3>
            <p>Proses pendaftaran Anda sedang berjalan...</p>
            <button onClick={closeNotif} className="notif-btn">
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* --- KOTAK FORM PENDAFTARAN (Tetap sama seperti sebelumnya) --- */}
      <section className="daftar-card">
        <div className="daftar-header">
          <h1>Mulai Perjalananmu</h1>
          <p>Buat akun dan kenali dirimu lebih baik.</p>
        </div>

        <form className="daftar-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input type="email" id="email" name="email" placeholder="kelompok5@gmail.com" required />
          </div>

          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input type="text" id="username" name="username" placeholder="kelompok5" required />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input type="password" id="password" name="password" placeholder="kelompok5" required />
          </div>

          <div className="form-group">
            <label htmlFor="confirm-password">Konfirmasi Password</label>
            <input type="password" id="confirm-password" name="confirm-password" placeholder="kelompok5" required />
          </div>

          <button type="submit" className="btn-submit">
            DAFTAR <span className="arrow-icon">→</span>
          </button>
        </form>

        <div className="daftar-footer-inside">
          <p>
            Sudah punya akun? <a href="/login" className="link-login">Masuk di sini</a>
          </p>
          <p className="copyright-text">&copy; 2026 Mindglow</p>
        </div>
      </section>
    </main>
  );
};

export default DaftarPage;