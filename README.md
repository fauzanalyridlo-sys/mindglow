# 🌿 MindGlow

**Website Pendukung Kesejahteraan Mental**

## 📖 Deskripsi Proyek

MindGlow merupakan website yang dirancang untuk membantu pengguna mengenali kondisi emosional, mencatat suasana hati, dan melakukan refleksi diri.

Pengembangan MindGlow berfokus pada pengalaman pengguna yang nyaman, tampilan responsif, dan fitur pendukung kesejahteraan mental.

## ✨ Fitur MindGlow

### Fitur Utama (MVP)

1. **Beranda**
   - Menampilkan informasi utama MindGlow.
   - Menyediakan navigasi ke fitur utama.

2. **Cek Harian**
   - Memungkinkan pengguna memilih suasana hati.
   - Menyediakan interaksi pencatatan kondisi emosional.
   - Menampilkan umpan balik setelah check-in.

3. **Jurnal**
   - Memungkinkan pengguna menulis refleksi diri.
   - Menyediakan fitur pencatatan jurnal.
   - Menampilkan catatan sebelumnya.

### Fitur Pendukung

- **Relaksasi:** Panduan latihan pernapasan 4–7–8.
- **Wawasan:** Konten edukasi.
- **Akademik:** Fitur pendukung akademik sesuai rancangan Figma.

### Pengembangan Lanjutan

- **Refleksi AI:** Integrasi layanan AI untuk membantu proses refleksi pengguna.

### Autentikasi

- Halaman Login.
- Halaman Register.
- Halaman Lupa Password.
- Halaman Buat Kata Sandi Baru dengan validasi frontend.

> **Catatan:** Beberapa fitur masih berupa prototipe frontend. Integrasi API reset password belum selesai. Login menggunakan Google direncanakan untuk pengembangan berikutnya.

---

## 🛠️ Teknologi

| Bagian | Teknologi |
|---|---|
| Frontend | React 19, TypeScript 6, Vite 8 |
| Routing | React Router 7 |
| Backend | Laravel 13 |
| Bahasa Backend | PHP 8.3+ |
| Database bawaan | SQLite |
| Database pengembangan | PostgreSQL (opsional, sesuai konfigurasi lokal) |
| Version Control | Git dan GitHub |

---

## 📁 Struktur Folder

```text
mindglow/
├── backend/
│   ├── app/
│   ├── config/
│   ├── database/
│   └── routes/
├── frontend/
│   ├── public/
│   └── src/
├── modul-6-html/
├── PRD.md
└── README.md
```

---

## 🚀 Panduan Menjalankan Proyek

### Persyaratan

Pastikan perangkat sudah memiliki:

- Git
- PHP 8.3 atau lebih baru
- Composer
- Node.js dan npm yang kompatibel dengan Vite 8
- SQLite atau PostgreSQL

### 1. Clone Repositori

```bash
git clone https://github.com/fauzanalyridlo-sys/mindglow.git
cd mindglow
```

### 2. Menjalankan Backend Laravel

Masuk ke folder backend:

```bash
cd backend
composer install
```

Buat file konfigurasi lingkungan:

```bash
cp .env.example .env
php artisan key:generate
```

Secara bawaan, `.env.example` menggunakan SQLite.

Jika menggunakan SQLite, siapkan file database:

```bash
touch database/database.sqlite
```

Periksa konfigurasi database di `.env`, kemudian jalankan:

```bash
php artisan migrate
php artisan serve
```

Backend biasanya berjalan di:

`http://127.0.0.1:8000`

**Jika menggunakan PostgreSQL**, ubah pengaturan database pada `.env` sesuai lingkungan lokal sebelum menjalankan migrasi.

### 3. Menjalankan Frontend React

Buka terminal baru dari folder utama proyek:

```bash
cd frontend
npm install
npm run dev
```

Frontend biasanya dapat diakses di:

`http://localhost:5173`

### 4. Build Frontend

```bash
npm run build
```

### 5. Pemeriksaan Kode

```bash
npm run lint
```

---

## 🎨 Desain Figma

**Link Figma Modul 5:**
(https://www.figma.com/design/UDo96YbSVLBGPN65TpP2S7/MindGlow?node-id=0-1&t=f3LnhtznFw3S3zCh-1)

---

## 👥 Kontribusi Anggota Kelompok

| Nama Anggota | Kontribusi |
|---|---|
| [Muhammad Fauzan Aly Ridlo] | [mengerjakan footer public&app, mengerjakan navbar public&app, mengerjakan halaman landing page dan check-in harian, serta merapikan routes journal dan seluruh bagian CSS login (login, lupa sandi, tautan reset sandi, halaman buat sandi baru), mengelola dan memonitor GitHub, serta membuat PRD] |
| [Dicky Adi Nugroho] | [mengerjakan halaman AI, insight/wawasan, relaksasi, dan membantu pengerjaan bagian akademik ] |
| [Lambang Seto Insani] | [mengerjakan halaman home dashboard, halaman journal, dan profile, dan register/daftar] |
| [Amandania Sagala] | [mengerjakan seluruh bagian login (login, lupa sandi, tautan reset sandi, halaman buat sandi baru)] |
| [ Resita Istania Purwanto ] | [mengerjakan beberapa bagian halaman akademik] |

> Isi berdasarkan kontribusi aktual masing-masing anggota Kelompok 5.

---

## 🤖 Dokumentasi Penggunaan AI

Selama pengembangan MindGlow, AI digunakan sebagai alat bantu untuk memahami kode, memperbaiki tampilan, dan membantu penyusunan komponen frontend.

### Log Prompt dan Perbaikan

| No. | Kebutuhan / Prompt | Bantuan AI | Perbaikan dan Verifikasi |
|---|---|---|---|
| 1 | Memperbaiki tampilan halaman Login | Saran CSS untuk kartu Login | Menyesuaikan posisi kartu dan background |
| 2 | Menghubungkan navigasi autentikasi | Saran penggunaan tautan navigasi | Menghubungkan Login, Register, dan Lupa Password |
| 3 | Membuat halaman Buat Kata Sandi Baru | Contoh komponen React dan CSS | Menambahkan validasi frontend |
| 4 | Memeriksa kesiapan frontend | Panduan menjalankan build | Menjalankan `npm run build` hingga berhasil |

### Prinsip Penggunaan AI

- AI digunakan sebagai alat bantu pengembangan.
- Kode hasil saran AI diperiksa sebelum digunakan.
- Perubahan diuji melalui browser dan proses build.
- Keputusan akhir implementasi tetap dilakukan oleh pengembang.

---

## 🧪 Pengujian

Pengujian yang menjadi bagian dari pengembangan meliputi:

- Pemeriksaan tampilan desktop.
- Pemeriksaan tampilan mobile.
- Pengujian navigasi.
- Pengujian interaksi formulir.
- Validasi input.
- Pemeriksaan build frontend.
- Pengujian integrasi backend sesuai kesiapan fitur.

### Hasil Pengujian yang Tercatat

Build frontend berhasil dijalankan menggunakan:

```bash
npm run build
```

Hasil:

```text
✓ 124 modules transformed.
✓ built in 522ms
```

---

## 📄 Product Requirements Document

Dokumen kebutuhan produk tersedia pada:

[PRD.md](PRD.md)

---

## 🔗 Repositori GitHub

https://github.com/fauzanalyridlo-sys/mindglow

---
