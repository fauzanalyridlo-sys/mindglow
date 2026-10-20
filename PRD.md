# PRODUCT REQUIREMENTS DOCUMENT (PRD)

## MINDGLOW
Website Pendukung Kesejahteraan Mental

**Kelompok:** 5  
**Modul:** 7 - Transformasi Desain Figma ke Prototipe Web Interaktif  
**Status:** Draft  
**Repository:** https://github.com/fauzanalyridlo-sys/mindglow  
**Figma:** [https://www.figma.com/design/UDo96YbSVLBGPN65TpP2S7/MindGlow?node-id=0-1&t=f3LnhtznFw3S3zCh-1]

---

## 1. Ringkasan Produk

MindGlow merupakan website yang dirancang untuk
membantu pengguna mengenali kondisi emosional,
mencatat suasana hati, dan melakukan refleksi diri.

## 2. Latar Belakang

Kesehatan mental merupakan salah satu aspek penting dalam kehidupan sehari-hari yang dapat memengaruhi kondisi emosional, aktivitas, serta hubungan sosial seseorang. Namun, tidak semua individu memiliki kebiasaan untuk mengenali, memahami, dan mencatat perubahan suasana hati yang mereka alami.

Seiring berkembangnya teknologi digital, diperlukan sebuah media yang mudah diakses untuk membantu pengguna melakukan pemantauan kondisi emosional dan refleksi diri secara mandiri.

MindGlow dikembangkan sebagai website pendukung kesejahteraan mental yang menyediakan fitur seperti check-in harian, jurnal pribadi, latihan relaksasi, wawasan seputar kesehatan mental, serta fitur refleksi berbasis AI.

Melalui pendekatan antarmuka yang sederhana, nyaman, dan mudah digunakan, MindGlow diharapkan dapat membantu pengguna membangun kebiasaan mengenali emosi, mengekspresikan perasaan, dan melakukan refleksi diri secara lebih teratur.

MindGlow berfungsi sebagai sarana pendukung kesejahteraan mental dan bukan sebagai pengganti diagnosis maupun layanan profesional kesehatan mental.

## 3. Tujuan Produk

- Membantu pengguna mengenali suasana hati.
- Memfasilitasi pencatatan kondisi emosional harian.
- Menyediakan sarana refleksi diri.
- Menyediakan fitur pendukung kesejahteraan mental.

## 4. Target Pengguna

Mahasiswa usia 18- 24 tahun yang sedang mengalami tekanan emosional akibat tuntutan akademik, hubungan sosial, maupun 
ketidakpastian masa depan.

## 5. Ruang Lingkup MVP

### 5.1 Definisi MVP

Minimum Viable Product (MVP) MindGlow merupakan
versi awal website yang berfokus pada kebutuhan
utama pengguna dalam mengenali, mencatat,
dan merefleksikan kondisi emosional.

MVP dirancang dengan mengutamakan fitur
Beranda, Cek Harian, dan Jurnal.

### 5.2 Must Have

1. Beranda
   - Menampilkan informasi utama MindGlow.
   - Menyediakan navigasi ke fitur utama.

2. Cek Harian
   - Memungkinkan pengguna memilih suasana hati.
   - Memungkinkan pengguna mengirim hasil check-in.
   - Menampilkan umpan balik setelah check-in.

3. Jurnal
   - Memungkinkan pengguna menulis refleksi.
   - Memungkinkan pengguna menyimpan catatan.
   - Memungkinkan pengguna melihat catatan sebelumnya.

### 5.3 Should Have

1. Relaksasi 4–7–8
   - Menampilkan panduan latihan pernapasan.
   - Menyediakan timer interaktif.

2. Wawasan
   - Menampilkan konten edukasi.

3. Akademik
   - Menyediakan fitur pendukung akademik
     sesuai rancangan Figma.

### 5.4 Later

1. Refleksi AI
   - Integrasi layanan AI.
   - Pengembangan respons refleksi
     berdasarkan masukan pengguna.

### 5.5 Batasan Pengembangan Modul 7

Seluruh halaman yang telah dibagi kepada
anggota kelompok dapat dikembangkan sebagai
prototipe frontend.

Prioritas fungsionalitas diberikan kepada
fitur MVP.

Fitur pendukung dan lanjutan dapat
diimplementasikan dalam bentuk prototipe
interaktif sesuai kebutuhan dan waktu pengerjaan.

Integrasi backend dilakukan berdasarkan
kesiapan pengembangan dan kesepakatan tim.


## 6. Daftar Fitur MindGlow

| No | Fitur | Deskripsi |
|----|-------|-----------|
| 1 | Beranda | Halaman utama MindGlow |
| 2 | Cek Harian | Pencatatan suasana hati |
| 3 | Jurnal | Catatan refleksi pengguna |
| 4 | Akademik | mengelola jadwal tugas kuliah |
| 5 | Wawasan | informasi ringkasan mengenai kondisi user |
| 6 | Refleksi AI | melakukan refleksi dengan ai mengenai kondisi diri  |
| 7 | Relaksasi | Latihan pernapasan 4-7-8 |

## 7. User Story

### US-01: Cek Harian

Sebagai pengguna, saya ingin mencatat suasana hati
agar dapat mengenali kondisi emosional saya.

### US-02: Jurnal

Sebagai pengguna, saya ingin menulis jurnal
agar dapat merefleksikan pengalaman sehari-hari.

## 8. Acceptance Criteria

### Fitur Cek Harian

- Pengguna dapat membuka halaman Cek Harian.
- Pengguna dapat memilih suasana hati.
- Pengguna dapat menekan tombol Simpan.
- Sistem memberikan umpan balik setelah interaksi.
- Tampilan responsif pada perangkat mobile dan desktop.

### Fitur Beranda

- Halaman menampilkan identitas MindGlow.
- Navigasi dapat digunakan.
- Tombol menuju fitur terkait berfungsi.
- Tampilan mengikuti desain Figma Modul 5.

## 9. Teknologi

### Frontend
- React
- TypeScript
- Vite

### Backend
- Laravel

## 10. Pengujian

- Pengujian tampilan desktop.
- Pengujian tampilan mobile.
- Pengujian navigasi.
- Pengujian interaksi dinamis.
- Pemeriksaan runtime error.

## 11. Panduan Menjalankan Proyek
### Menjalankan Frontend

1. Pastikan Node.js dan npm sudah terpasang.
2. Buka terminal pada folder frontend:

   ```bash
   cd frontend
   ```

3. Instal dependensi:

   ```bash
   npm install
   ```

4. Jalankan server pengembangan:

   ```bash
   npm run dev
   ```

5. Buka alamat lokal yang ditampilkan Vite pada terminal.

### Menjalankan Backend

Backend MindGlow menggunakan Laravel.

1. Pastikan PHP dan Composer sudah terpasang.
2. Buka terminal baru pada folder backend:

   ```bash
   cd backend
   ```

3. Instal dependensi:

   ```bash
   composer install
   ```

4. Siapkan file konfigurasi lingkungan:

   ```bash
   cp .env.example .env
   ```

5. Buat application key:

   ```bash
   php artisan key:generate
   ```

6. Konfigurasikan database melalui file `.env`, lalu jalankan migrasi:

   ```bash
   php artisan migrate
   ```

7. Jalankan server Laravel:

   ```bash
   php artisan serve
   ```

### Build dan Pemeriksaan Frontend

Untuk membuat build produksi:

```bash
npm run build
```

Untuk memeriksa kode menggunakan Oxlint:

```bash
npm run lint
```

**Catatan:** Frontend dan backend dijalankan pada terminal terpisah. Konfigurasi koneksi API perlu disesuaikan dengan implementasi integrasi yang digunakan.