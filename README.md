# 🌿 MindGlow

**Website Pendukung Kesejahteraan Mental**

MindGlow adalah aplikasi web yang membantu pengguna mencatat suasana hati, menulis jurnal pribadi, melakukan refleksi diri, serta mengelola aktivitas akademik.

Aplikasi dikembangkan menggunakan Next.js, React, TypeScript, Prisma, dan PostgreSQL.

## ✨ Fitur Aplikasi

### 1. Autentikasi
- Registrasi dan login.
- Verifikasi email.
- Lupa password dan reset password.
- Login menggunakan Google.
- Logout dan pengelolaan sesi pengguna.

Catatan: keberhasilan setiap metode autentikasi perlu diverifikasi melalui pengujian.

### 2. Cek Harian
- Mencatat suasana hati.
- Mencatat tingkat energi.
- Mencatat durasi tidur.
- Memilih aktivitas harian.
- Menyimpan atau memperbarui check-in harian.

### 3. Jurnal
- Menulis catatan refleksi pribadi.
- Melihat daftar jurnal yang tersimpan.
- Menghapus jurnal.

### 4. Dashboard
- Menampilkan ringkasan check-in hari ini.
- Menampilkan ringkasan tugas akademik.
- Menampilkan tugas berdasarkan prioritas.

### 5. Agenda Akademik
- Menambahkan tugas kuliah.
- Menentukan mata kuliah dan deadline.
- Memilih prioritas dan jenis tugas.
- Menandai tugas sebagai selesai atau membatalkan status selesai.
- Menghapus tugas.

### 6. Wawasan
- Menampilkan ringkasan statistik dari riwayat check-in.
- Menghitung rata-rata suasana hati, energi, dan durasi tidur.
- Menampilkan tren check-in berdasarkan periode.
- Menghasilkan insight menggunakan aturan yang diterapkan dalam kode.

Insight bukan diagnosis medis dan tidak menggantikan bantuan profesional.

### 7. Refleksi AI
Aplikasi menyediakan halaman AI dan API percakapan. Implementasi menggunakan konfigurasi layanan AI yang tersedia pada kode proyek.

Ketersediaan layanan bergantung pada konfigurasi lingkungan dan penyedia AI yang digunakan.

### 8. Relaksasi
Aplikasi menyediakan halaman relaksasi untuk mendukung aktivitas menenangkan diri.

### 9. Profil
- Melihat informasi profil.
- Memperbarui username, email, dan nomor telepon.
- Mengganti password untuk akun yang memiliki password lokal.
- Keluar dari akun.

### 10. Momo
Aplikasi menyediakan halaman dan API Momo. Detail perilaku dan sinkronisasi mengikuti implementasi yang tersedia dalam kode.

## 🛠️ Teknologi

| Bagian | Teknologi |
|---|---|
| Framework web | Next.js 16 |
| UI | React 19 |
| Bahasa | TypeScript |
| API | Next.js Route Handlers |
| ORM | Prisma |
| Database | PostgreSQL |
| Validasi input | Zod |
| Autentikasi password | bcryptjs |
| Autentikasi Google | Google OAuth |
| Email | Nodemailer dan Resend |
| Pengujian | Vitest |
| Linting | ESLint |
| Version control | Git dan GitHub |

Versi dependensi yang lebih terperinci dapat dilihat pada `nextjs/package.json`.

## 📁 Struktur Proyek

```text
mindglow/
├── backend/                 # Folder backend lama/pendukung
├── frontend/                # Folder frontend lama/pendukung
├── modul-6-html/
├── nextjs/                  # Aplikasi utama yang sedang dikembangkan
│   ├── prisma/
│   ├── scripts/
│   ├── src/
│   │   ├── app/
│   │   │   ├── (app)/
│   │   │   ├── (auth)/
│   │   │   ├── (public)/
│   │   │   └── api/
│   │   ├── components/
│   │   ├── lib/
│   │   ├── styles/
│   │   └── views/
│   ├── package.json
│   └── next.config.ts
├── PRD.md
└── README.md