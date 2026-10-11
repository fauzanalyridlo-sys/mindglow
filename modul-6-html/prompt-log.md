!!prompt, jangan langsung ambil kesimpulan kalau jawaban AI nya udh bener ya guys, cek lagi siapatau ada yang kurang!!
Tugas:
Ubah desain/screenshot halaman yang saya berikan menjadi HTML5 semantic.

Ketentuan wajib:
1. Gunakan HTML5 semantic seperti:
   <header>, <nav>, <main>, <section>, <article>, <footer>.
2. Hindari penggunaan <div> yang berlebihan (div-soup).
   <div> tetap boleh digunakan jika memang diperlukan untuk grouping
   yang tidak memiliki makna semantik.
3. Jangan gunakan CSS sama sekali.
4. Jangan gunakan <style>.
5. Jangan gunakan inline style.
6. Jangan gunakan Tailwind, Bootstrap, atau framework CSS lainnya.
7. Gunakan heading secara hierarkis:
   satu <h1> utama, kemudian <h2> untuk section dan <h3> untuk subbagian.
8. Gunakan <a> untuk navigasi/perpindahan halaman atau section.
9. Gunakan <button> untuk aksi/interaksi form.
10. Untuk form, gunakan <label> yang terhubung dengan
    <input> melalui atribut for dan id.
11. Semua <img> wajib memiliki alt yang relevan.
    Jika gambar hanya dekoratif, gunakan alt="".
12. Gunakan relative path untuk asset.
    Contoh: assets/images/nama-gambar.webp
13. Jangan membuat database, API, autentikasi, JavaScript,
    atau backend. Fokus hanya pada struktur HTML5.
14. Jangan mengarang konten yang tidak ada pada desain.
15. Pertahankan teks, urutan informasi, dan alur dari desain.

Output:
- Berikan hanya kode HTML.
- Jangan menambahkan CSS.
- Setelah kode, berikan daftar singkat bagian yang perlu saya
  cek secara manual sebelum validasi W3C.


//prompt tambahan/revisi halaman login//
Saya sudah melakukan review manual terhadap kode HTML yang dibuat sebelumnya.

Tolong revisi kode HTML tersebut dengan ketentuan berikut:

1. Pertahankan struktur dan konten yang sudah sesuai dengan desain.
2. Jangan menambahkan CSS, <style>, inline style, Tailwind,
   Bootstrap, JavaScript, database, API, autentikasi, atau backend.
3. Pertahankan penggunaan semantic HTML5.
4. Jangan menambahkan <div> yang tidak diperlukan.
5. Pastikan heading tetap hierarkis dan hanya memiliki satu <h1> utama.
6. Pada form login, pastikan setiap <label> terhubung dengan
   input menggunakan atribut for dan id.
7. Karena field login menerima Email/Username, gunakan struktur
   dan atribut input yang konsisten dengan label tersebut.
8. Jangan menggunakan data contoh atau dummy content yang tidak
   terdapat pada desain.
9. Pertahankan relative path untuk gambar dan link halaman.
10. Pastikan link "Lupa sandi" dan "Daftar sekarang" mengarah
    ke nama file HTML yang benar-benar digunakan dalam project.
11. Jika gambar hanya bersifat dekoratif, gunakan alt="".
12. Jangan mengubah teks, urutan informasi, atau alur desain
    tanpa alasan yang diperlukan untuk memenuhi semantic HTML5.

Output:
- Berikan kode HTML hasil revisi.
- Setelah kode, berikan daftar perubahan yang dilakukan
  dan bagian yang masih perlu saya cek secara manual sebelum
  validasi W3C.



  **// prompt tambahan/revisi halaman AI Chat //**

Saya sudah melakukan review manual terhadap kode HTML yang dibuat sebelumnya.

Tolong revisi kode HTML halaman AI Chat tersebut dengan ketentuan berikut:

1. Pertahankan struktur, konten, teks, dan urutan informasi yang sudah sesuai dengan desain.
2. Jangan menambahkan CSS, `<style>`, inline style, Tailwind, Bootstrap, JavaScript, database, API, autentikasi, atau backend.
3. Pertahankan penggunaan semantic HTML5 sesuai fungsi setiap elemen.
4. Jangan menambahkan `<div>` yang tidak diperlukan.
5. Pastikan heading tetap hierarkis dan hanya memiliki satu `<h1>` utama.
6. Gunakan elemen HTML yang sesuai untuk area percakapan, pesan pengguna, respons AI, dan form input pesan berdasarkan desain yang tersedia.
7. Jika terdapat form untuk mengirim pesan, pastikan setiap `<label>` terhubung dengan input menggunakan atribut `for` dan `id`, apabila label tersedia atau diperlukan.
8. Gunakan elemen `<button>` untuk tindakan seperti mengirim pesan atau tindakan lain yang memang ditampilkan sebagai tombol pada desain.
9. Jangan menambahkan percakapan, respons AI, atau data contoh yang tidak terdapat pada desain.
10. Pertahankan relative path untuk gambar, ikon lokal, dan link halaman.
11. Jika gambar hanya bersifat dekoratif, gunakan `alt=""`. Jika gambar memiliki makna, gunakan teks alternatif yang sesuai.
12. Jangan mengubah teks, urutan informasi, atau alur desain tanpa alasan yang diperlukan untuk memenuhi semantic HTML5.
13. Jangan membuat fitur chat benar-benar berfungsi menggunakan JavaScript atau API. Fokus hanya pada struktur HTML sesuai desain.

**Output:**

* Berikan kode HTML hasil revisi secara lengkap.
* Setelah kode, berikan daftar perubahan yang dilakukan.
* Sebutkan bagian yang masih perlu saya cek secara manual sebelum validasi W3C.


**// prompt tambahan/revisi halaman AI Page //**

Saya sudah melakukan review manual terhadap kode HTML yang dibuat sebelumnya.

Tolong revisi kode HTML halaman AI Page tersebut dengan ketentuan berikut:

1. Pertahankan struktur, konten, teks, dan urutan informasi yang sudah sesuai dengan desain.
2. Jangan menambahkan CSS, `<style>`, inline style, Tailwind, Bootstrap, JavaScript, database, API, autentikasi, atau backend.
3. Pertahankan penggunaan semantic HTML5.
4. Jangan menambahkan `<div>` yang tidak diperlukan.
5. Pastikan heading tetap hierarkis dan hanya memiliki satu `<h1>` utama.
6. Gunakan elemen semantik yang sesuai untuk bagian utama halaman, navigasi, konten informasi, dan bagian pendukung berdasarkan desain.
7. Jika terdapat daftar fitur, pilihan AI, atau informasi yang ditampilkan dalam bentuk daftar, gunakan elemen `<ul>` atau `<ol>` sesuai struktur aslinya.
8. Jika terdapat link menuju halaman lain, gunakan elemen `<a>` dengan atribut `href` yang mengarah ke nama file HTML yang benar-benar digunakan dalam project.
9. Jika terdapat tombol tindakan, gunakan elemen `<button>` sesuai fungsinya. Jangan menggunakan link sebagai pengganti tombol tanpa alasan yang sesuai.
10. Jangan menambahkan fitur, informasi, atau data contoh yang tidak terdapat pada desain.
11. Pertahankan relative path untuk gambar, ikon lokal, dan link halaman.
12. Jika gambar hanya bersifat dekoratif, gunakan `alt=""`. Jika gambar menyampaikan informasi, gunakan teks alternatif yang sesuai.
13. Jangan mengubah teks, urutan informasi, atau alur desain tanpa alasan yang diperlukan untuk memenuhi semantic HTML5.
14. Jangan menambahkan fungsi interaktif yang membutuhkan JavaScript atau backend. Fokus hanya pada struktur HTML.

**Output:**

* Berikan kode HTML hasil revisi secara lengkap.
* Setelah kode, berikan daftar perubahan yang dilakukan.
* Sebutkan bagian yang masih perlu saya cek secara manual sebelum validasi W3C.


**// prompt tambahan/revisi halaman Insight //**

Saya sudah melakukan review manual terhadap kode HTML yang dibuat sebelumnya.

Tolong revisi kode HTML halaman Insight tersebut dengan ketentuan berikut:

1. Pertahankan struktur, konten, teks, dan urutan informasi yang sudah sesuai dengan desain.
2. Jangan menambahkan CSS, `<style>`, inline style, Tailwind, Bootstrap, JavaScript, database, API, autentikasi, atau backend.
3. Pertahankan penggunaan semantic HTML5.
4. Jangan menambahkan `<div>` yang tidak diperlukan.
5. Pastikan heading tetap hierarkis dan hanya memiliki satu `<h1>` utama.
6. Gunakan elemen HTML yang sesuai untuk menampilkan judul insight, ringkasan informasi, hasil refleksi, atau bagian lain yang benar-benar terdapat pada desain.
7. Jika informasi ditampilkan sebagai daftar, gunakan `<ul>` atau `<ol>` sesuai urutan dan bentuk informasi pada desain.
8. Jika terdapat data berbentuk tabel, gunakan elemen `<table>` dengan struktur yang sesuai. Jangan mengubah informasi biasa menjadi tabel tanpa alasan.
9. Jangan menambahkan hasil analisis, skor, grafik, statistik, atau data dummy yang tidak terdapat pada desain.
10. Jika terdapat link navigasi, pastikan atribut `href` menggunakan relative path dan nama file HTML yang benar-benar tersedia dalam project.
11. Jika terdapat tombol tindakan, gunakan elemen `<button>` sesuai fungsinya.
12. Pertahankan relative path untuk gambar dan ikon lokal.
13. Jika gambar hanya bersifat dekoratif, gunakan `alt=""`. Jika gambar memiliki makna, gunakan teks alternatif yang sesuai.
14. Jangan mengubah teks, urutan informasi, atau alur desain tanpa alasan yang diperlukan untuk memenuhi semantic HTML5.
15. Jangan menambahkan fitur pengolahan data atau interaksi menggunakan JavaScript. Fokus hanya pada struktur HTML sesuai desain.

**Output:**

* Berikan kode HTML hasil revisi secara lengkap.
* Setelah kode, berikan daftar perubahan yang dilakukan.
* Sebutkan bagian yang masih perlu saya cek secara manual sebelum validasi W3C.


**// prompt tambahan/revisi halaman Relaksasi //**

Saya sudah melakukan review manual terhadap kode HTML yang dibuat sebelumnya.

Tolong revisi kode HTML halaman Relaksasi tersebut dengan ketentuan berikut:

1. Pertahankan struktur, konten, teks, dan urutan informasi yang sudah sesuai dengan desain.
2. Jangan menambahkan CSS, `<style>`, inline style, Tailwind, Bootstrap, JavaScript, database, API, autentikasi, atau backend.
3. Pertahankan penggunaan semantic HTML5.
4. Jangan menambahkan `<div>` yang tidak diperlukan.
5. Pastikan heading tetap hierarkis dan hanya memiliki satu `<h1>` utama.
6. Gunakan elemen semantik yang sesuai untuk bagian pengantar, pilihan aktivitas relaksasi, petunjuk, dan bagian lain yang memang terdapat pada desain.
7. Jika aktivitas relaksasi ditampilkan sebagai daftar, gunakan `<ul>` atau `<ol>` sesuai struktur informasi aslinya.
8. Jika terdapat link menuju halaman lain, pastikan atribut `href` mengarah ke nama file HTML yang benar-benar digunakan dalam project.
9. Jika terdapat tombol tindakan, gunakan elemen `<button>` sesuai fungsinya. Jangan membuat tombol menjalankan fungsi yang membutuhkan JavaScript.
10. Jangan menambahkan aktivitas, instruksi, durasi, audio, atau informasi contoh yang tidak terdapat pada desain.
11. Pertahankan relative path untuk gambar, ikon lokal, audio, atau aset lain yang memang digunakan dalam desain.
12. Jika gambar hanya bersifat dekoratif, gunakan `alt=""`. Jika gambar memiliki makna, gunakan teks alternatif yang sesuai.
13. Jangan mengubah teks, urutan informasi, atau alur desain tanpa alasan yang diperlukan untuk memenuhi semantic HTML5.
14. Fokus pada struktur HTML, bukan implementasi fitur relaksasi yang membutuhkan JavaScript atau backend.

**Output:**

* Berikan kode HTML hasil revisi secara lengkap.
* Setelah kode, berikan daftar perubahan yang dilakukan.
* Sebutkan bagian yang masih perlu saya cek secara manual sebelum validasi W3C.

