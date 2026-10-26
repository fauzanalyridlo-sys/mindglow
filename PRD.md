**PRODUCT REQUIREMENTS DOCUMENT (PRD)**

Repositori: https://github.com/fauzanalyridlo-sys/mindglow
Figma: https://www.figma.com/design/UDo96YbSVLBGPN65TpP2S7/MindGlow?node-id=0-1&t=f3LnhtznFw3S3zCh-1

## 1. Ringkasan Produk
MindGlow adalah aplikasi web pendukung kesejahteraan mental yang membantu pengguna mengenali suasana hati, melakukan check-in harian, menulis jurnal pribadi, melihat ringkasan kebiasaan, dan mengelola tugas akademik. Aplikasi juga menyediakan halaman relaksasi, refleksi, serta fitur percakapan AI yang bergantung pada konfigurasi layanan eksternal.

MindGlow bukan alat diagnosis dan tidak menggantikan tenaga profesional kesehatan mental.

## 2. Latar Belakang
Mahasiswa dapat menghadapi tekanan dari perkuliahan, tugas, relasi sosial, dan perubahan rutinitas. Pencatatan suasana hati dan refleksi diri yang mudah diakses dapat membantu pengguna mengenali pola kesehariannya. MindGlow menggabungkan pencatatan emosional dan agenda akademik dalam satu aplikasi web.

## 3. Tujuan Produk
- Memudahkan pencatatan kondisi emosional dan kebiasaan harian.
- Menyediakan ruang jurnal pribadi yang tersimpan pada akun pengguna.
- Menampilkan ringkasan dan tren dari data check-in.
- Membantu pengelolaan tugas akademik berdasarkan tenggat dan prioritas.
- Menyediakan materi atau aktivitas pendukung refleksi dan relaksasi.

## 4. Target Pengguna
Target utama adalah mahasiswa usia sekitar 18–24 tahun yang ingin membangun kebiasaan refleksi diri dan mengatur aktivitas akademik. Penggunaan tidak terbatas pada kelompok tersebut.

## 5. Ruang Lingkup dan Status Implementasi
Dokumen ini membedakan fitur yang memiliki implementasi kode dari fitur yang telah lulus pengujian. Keberadaan halaman/API tidak otomatis berarti seluruh alur sudah teruji dalam produksi.
Modul	Kebutuhan utama	Status berdasarkan kode
Autentikasi	Registrasi, login, verifikasi email, reset password, Google login, logout	Halaman/API tersedia; perlu uji alur end-to-end
Cek Harian	Catat mood, energi, tidur, aktivitas per hari	API penyimpanan dan pembacaan tersedia
Jurnal	Buat, lihat, hapus jurnal milik sendiri	API dan antarmuka tersedia
Dashboard	Ringkasan check-in dan tugas	API tersedia
Akademik	Tambah, lihat, tandai selesai, hapus tugas	API dan antarmuka tersedia
Wawasan	Statistik dan tren check-in	API insight berbasis aturan tersedia
Profil	Lihat dan ubah profil, ganti password lokal	API dan antarmuka tersedia
Refleksi AI	Percakapan melalui layanan AI	Endpoint tersedia; tergantung API key/konfigurasi
Relaksasi dan refleksi	Halaman pendukung kesejahteraan mental	Halaman tersedia; detail interaksi perlu diuji


## 6. Kebutuhan Fungsional
6.1 Autentikasi dan Sesi
- Pengguna dapat mengakses halaman registrasi dan login.
- Sistem menyediakan alur verifikasi email, lupa password, dan reset password.
- Sistem memiliki integrasi login Google yang memerlukan konfigurasi OAuth.
- Fitur pribadi memerlukan sesi pengguna yang valid.
- Pengguna dapat logout.
Kriteria penerimaan: pengguna yang belum login tidak dapat membaca data pribadi melalui endpoint terproteksi; proses autentikasi yang diaktifkan berhasil diuji dengan konfigurasi yang sesuai.
6.2 Cek Harian
- Pengguna mencatat satu check-in per tanggal sesuai zona waktu Asia/Jakarta.
- Mood tersedia dalam lima pilihan: Lelah/Down, Cemas, Biasa aja, Tenang, Semangat!.
- Energi berupa nilai 1–5.
- Durasi tidur 0–24 jam dengan kelipatan 0,5 jam.
- Pengguna dapat memilih aktivitas harian dan mengisi aktivitas lain.
- Pengiriman ulang pada tanggal yang sama memperbarui check-in, bukan membuat duplikat.
Kriteria penerimaan: input tidak valid ditolak; data check-in tersimpan untuk akun yang benar dan dapat dibaca kembali.
6.3 Jurnal Pribadi
- Pengguna dapat membuat jurnal berisi teks.
- Pengguna dapat melihat daftar jurnal miliknya, diurutkan dari yang terbaru.
- Pengguna dapat menghapus jurnal miliknya.
- Tidak ada klaim fitur edit jurnal karena belum terkonfirmasi pada antarmuka/API yang diperiksa.
Kriteria penerimaan: jurnal milik akun lain tidak dapat diakses atau dihapus melalui endpoint terproteksi.
6.4 Dashboard
- Menampilkan ringkasan mood, energi, dan tidur dari check-in hari ini jika tersedia.
- Menampilkan ringkasan tugas yang belum selesai dan daftar tugas prioritas.
Kriteria penerimaan: data dashboard sesuai data akun yang sedang login dan memperlihatkan kondisi kosong secara wajar.
6.5 Agenda Akademik
- Pengguna dapat menambahkan tugas dengan nama, mata kuliah, deadline, prioritas, dan jenis tugas.
- Prioritas: Rendah, Sedang, Tinggi.
- Jenis tugas: Kelompok, Individu.
- Pengguna dapat melihat tugas, mengubah status selesai/belum selesai, dan menghapus tugas.
- API mendukung pembaruan atribut tugas melalui PATCH; antarmuka yang diperiksa terutama mendukung perubahan status selesai.
Kriteria penerimaan: tugas hanya dapat dimodifikasi oleh pemiliknya; input dan tanggal yang tidak valid ditolak.
6.6 Wawasan dan Insight
- Menampilkan statistik check-in untuk periode 7 atau 30 hari.
- Menghitung rata-rata mood, energi, dan durasi tidur dari data yang tersedia.
- Menampilkan tren harian dan mood dominan.
- Menyediakan pesan insight berbasis aturan dalam kode, bukan diagnosis maupun hasil model AI.
Kriteria penerimaan: statistik berasal dari data pengguna yang login dan menangani hari tanpa check-in.
6.7 Profil dan Password
- Pengguna dapat melihat username, email, dan nomor telepon.
- Pengguna dapat memperbarui username, email, dan nomor telepon.
- Akun dengan password lokal dapat mengganti password setelah verifikasi password lama.
- Setelah penggantian password berhasil, sesi aktif dihapus sehingga pengguna perlu login kembali.
Kriteria penerimaan: validasi input dan konflik username/email ditangani; perubahan data tidak memengaruhi akun lain.
6.8 AI, Relaksasi, dan Refleksi
- Tersedia halaman AI dan endpoint percakapan AI.
- Integrasi AI menggunakan konfigurasi penyedia yang didukung kode, termasuk Groq dan OpenRouter.
- Tersedia halaman relaksasi dan refleksi sebagai fitur pendukung.
Kriteria penerimaan: alur AI diuji dengan konfigurasi valid, termasuk respons kegagalan penyedia; konten tidak diposisikan sebagai pengganti konseling profesional.

## 7. Kebutuhan Nonfungsional
- Keamanan: endpoint data pribadi memeriksa autentikasi dan kepemilikan data; password lokal disimpan dalam bentuk hash.
- Validasi: data masukan diperiksa pada server menggunakan skema validasi yang tersedia.
- Privasi: data jurnal dan check-in hanya ditampilkan untuk pemilik akun.
- Responsivitas: antarmuka perlu diuji pada desktop dan mobile.
- Keandalan: kesalahan jaringan, database, dan layanan eksternal harus ditangani tanpa membocorkan secret.
- Keterpeliharaan: implementasi menggunakan struktur aplikasi Next.js dan Prisma.

## 8. Arsitektur dan Teknologi
Lapisan	Teknologi
Aplikasi web	Next.js 16 dan React 19
Bahasa	TypeScript
Backend	Next.js Route Handlers (src/app/api)
ORM	Prisma 7
Database	PostgreSQL
Validasi	Zod
Hash password	bcryptjs
Integrasi email	Komponen SMTP/email dalam kode
Integrasi AI	Groq dan/atau OpenRouter sesuai konfigurasi


Aplikasi utama berada di direktori nextjs/. Perintah development dan build mengacu pada nextjs/package.json.

## 9. Data Utama
Entitas yang digunakan mencakup akun pengguna, sesi, check-in harian, jurnal, tugas akademik, dan data pendukung autentikasi serta pembatasan permintaan. Struktur tabel dan relasi yang definitif mengacu pada nextjs/prisma/schema.prisma.

## 10. Pengujian dan Verifikasi
Pengujian yang perlu dijalankan sebelum menyatakan fitur selesai:
1. npm run lint dari direktori nextjs/.
2. npm run build dari direktori nextjs/.
3. Uji registrasi, login, verifikasi email, reset password, Google login, dan logout.
4. Uji check-in harian, pembaruan check-in, jurnal, dashboard, wawasan, dan agenda akademik.
5. Uji akses tanpa login dan percobaan akses data akun lain.
6. Uji responsivitas, kondisi kosong, dan kegagalan jaringan.
7. Uji integrasi AI dan email dengan konfigurasi yang valid.
Status hasil pengujian: belum dicatat dalam dokumen ini; isi berdasarkan output pengujian aktual. Hasil build Vite dari versi proyek lama tidak digunakan sebagai bukti build Next.js.

## 11. Batasan Produk
- MindGlow tidak memberikan diagnosis medis atau penanganan darurat.
- Insight statistik bersifat deskriptif dan berbasis aturan.
- Fitur AI dan email memerlukan layanan eksternal serta environment variable yang benar.
- Fitur yang baru terlihat dari keberadaan halaman atau endpoint tetap membutuhkan verifikasi perilaku aktual.
