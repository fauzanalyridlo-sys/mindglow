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