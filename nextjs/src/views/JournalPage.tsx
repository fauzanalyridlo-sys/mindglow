'use client'

import '../styles/JournalPage.css'
import { useRef, useState } from 'react'

// Cetakan data sekarang kita tambah 'time'
interface JournalEntry {
  id: number;
  date: string;
  time: string; // <-- Tambahan untuk waktu
  text: string;
}

const JournalPage = () => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [inputText, setInputText] = useState("");
  
  const [journals, setJournals] = useState<JournalEntry[]>([
    {
      id: 1,
      date: "21 Sep 2026",
      time: "10:30", // Waktu contoh
      text: "Hari ini merasa agak tertekan karena anggota kelompok tugas proyek belum mulai pengerjaan padahal deadline makin dekat."
    }
  ]);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value); 
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const handleSave = () => {
    if (inputText.trim() === "") return;

    const now = new Date();
    // Format Tanggal (Contoh: 18 Okt 2026)
    const dateString = now.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
    // Format Waktu (Contoh: 15:35)
    const timeString = now.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    });

    const newEntry: JournalEntry = {
      id: Date.now(), 
      date: dateString,
      time: timeString, // Simpan waktu
      text: inputText
    };

    setJournals([newEntry, ...journals]);
    setInputText("");

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  // --- FUNGSI BARU: Menghapus Jurnal ---
  const handleDelete = (idToRemove: number) => {
    // Menyaring (membuang) jurnal yang ID-nya cocok dengan yang diklik
    const filteredJournals = journals.filter(journal => journal.id !== idToRemove);
    setJournals(filteredJournals);
  };

  return (
    <main className="journal-page-container">
      <header className="journal-header">
        <h1>JURNAL CURHAT PRIVAT</h1>
        <p>Tuliskan pengalamanmu disini</p>
      </header>

      <section className="journal-input-section">
        <div className="journal-input-card">
          <textarea 
            ref={textareaRef}
            className="journal-textarea" 
            placeholder="Bagaimana harimu? Apa hal yang paling menyita pikiranmu saat ini?..."
            value={inputText} 
            onChange={handleInput} 
            rows={3}
          ></textarea>
          
          <div className="journal-input-footer">
            <span className="auto-save-text">Otomatis tersimpan lokal</span>
            <button className="btn-simpan-journal" onClick={handleSave}>
              Simpan Jurnal
            </button>
          </div>
        </div>
      </section>

      <section className="journal-riwayat-section">
        <h2>Riwayat Catatan Jurnal</h2>
        <div className="journal-history-list">
          
          {journals.map((journal) => (
            <div className="journal-history-card" key={journal.id}>
              {/* Bagian Atas Kartu (Tanggal, Waktu, dan Tombol X) */}
              <div className="journal-card-header">
                <div className="journal-date-time">
                  <span className="journal-date">{journal.date}</span>
                  <span className="journal-time">• {journal.time}</span>
                </div>
                
                <button 
                  className="btn-delete-journal" 
                  onClick={() => handleDelete(journal.id)}
                  title="Hapus Curhatan"
                >
                  &times; {/* Ini adalah kode HTML untuk simbol silang (X) yang rapi */}
                </button>
              </div>
              
              {/* Bagian Isi Curhatan */}
              <p className="journal-text">{journal.text}</p>
            </div>
          ))}

        </div>
      </section>
    </main>
  );
};

export default JournalPage;