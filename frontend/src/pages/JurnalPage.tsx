import './JurnalPage.css';

const JurnalPage = () => {
  return (
    <main className="jurnal-page-container">
      {/* Bagian Judul Halaman */}
      <header className="jurnal-header">
        <h1>JURNAL CURHAT PRIVAT</h1>
        <p>Tulisanmu aman</p>
      </header>

      {/* Bagian Kotak Input Jurnal */}
      <section className="jurnal-input-section">
        <div className="jurnal-input-card">
          <textarea
            className="jurnal-textarea"
            placeholder="Bagaimana harimu? Apa hal yang paling menyita pikiranmu saat ini?..."
          ></textarea>

          <div className="jurnal-input-footer">
            <span className="auto-save-text">Otomatis tersimpan lokal</span>
            <button className="btn-simpan-jurnal">
              Simpan Jurnal
            </button>
          </div>
        </div>
      </section>

      {/* Bagian Riwayat (Bisa diisi nanti) */}
      <section className="jurnal-riwayat-section">
        <h2>Riwayat Catatan Jurnal</h2>
        {/* Nanti daftar riwayat jurnal akan muncul di sini */}
      </section>
    </main>
  );
};

export default JurnalPage;