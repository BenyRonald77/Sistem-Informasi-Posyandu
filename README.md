# Sistem Informasi Posyandu

Aplikasi web untuk kader posyandu: mencatat data keluarga dan balita, mencatat
hasil pengukuran pertumbuhan tiap kunjungan, memantau pertumbuhan balita
terhadap standar WHO, mengelola jadwal dan status imunisasi dasar, serta
menyiapkan pengingat menjelang jadwal posyandu bulanan dan imunisasi yang
jatuh tempo.

Lihat `PRD.md` untuk rincian kebutuhan produk dan `DESIGN.md` untuk arahan
desain (palet warna, tipografi, dan alasan tiap keputusan visual).

## Cara Install dan Menjalankan

Butuh Node.js versi 22 ke atas.

```bash
npm install
npm run seed        # opsional: isi data contoh (data uji) untuk demo
npm start
```

Aplikasi berjalan di `http://localhost:3000`. Port bisa diubah lewat variabel
lingkungan `PORT`, contoh: `PORT=4000 npm start`.

## Reseed Data Contoh

`npm run seed` akan MENGHAPUS seluruh data yang ada di folder `data/` dan
menggantinya dengan data contoh baru (2 keluarga, 2 balita, riwayat
pengukuran, dan pengaturan posyandu). Seluruh nama pada data contoh diberi
label jelas "(Data Uji)" karena memang bukan data balita/keluarga sungguhan,
supaya tidak disalahartikan sebagai rekam kesehatan asli.

Jangan jalankan `npm run seed` di atas data posyandu asli yang sudah terisi,
karena data lama akan hilang.

## Menguji Job Pengingat Tanpa Menunggu Jadwal

Job pengingat (posyandu H-3 dan imunisasi jatuh tempo) berjalan otomatis
setiap hari jam 06:00 melalui `node-cron` ketika server berjalan. Untuk
menguji tanpa menunggu jadwal:

```bash
npm run cron:jalankan-sekali
```

Perintah ini menjalankan logika yang sama persis dengan job harian, sekali
jalan, dan mencetak ringkasan notifikasi yang dibuat ke terminal. Notifikasi
yang dihasilkan juga bisa dilihat di halaman "Pengingat" pada aplikasi, atau
dipicu langsung dari tombol "Periksa Pengingat Sekarang" di halaman tersebut.

## Struktur Data

Data disimpan sebagai berkas JSON di folder `data/` (dibuat otomatis saat
aplikasi pertama kali berjalan), satu berkas per koleksi: `keluarga.json`,
`balita.json`, `pengukuran.json`, `imunisasiStatus.json`, `notifikasi.json`,
`pengaturan.json`. Folder ini tidak disertakan di git (lihat `.gitignore`)
karena berisi data yang dibuat saat aplikasi berjalan, bukan kode sumber.

## Alasan Pilihan Teknis

- **Node.js + Express + EJS**: cukup untuk kebutuhan aplikasi form dan
  tabel berbasis server-render, tanpa perlu proses build/bundler tambahan
  yang menyulitkan kader/pengelola menjalankannya di komputer sederhana.
- **Penyimpanan berkas JSON (`lib/store.js`)**: skala data satu posyandu
  (puluhan-ratusan balita) tidak butuh basis data server. Berkas JSON mudah
  dibaca, dicadangkan (backup tinggal salin folder `data/`), dan dipindahkan
  tanpa instalasi tambahan.
- **node-cron**: menjadwalkan job pengingat harian di dalam proses Node yang
  sama tanpa perlu konfigurasi cron sistem operasi terpisah, sekaligus
  mudah dipicu manual untuk pengujian (`npm run cron:jalankan-sekali`).
- **Chart.js (satu-satunya pustaka eksternal via CDN)**: dipakai khusus untuk
  menggambar grafik pertumbuhan (kurva rujukan WHO yang dioverlay dengan
  titik hasil ukur anak). Menulis ulang rendering kurva dan pita referensi
  secara presisi dari nol (SVG murni) berisiko menimbulkan kesalahan visual
  pada data yang dipakai untuk memantau kesehatan anak, sehingga memakai
  pustaka grafik yang sudah teruji lebih aman untuk kasus ini dibanding
  membangun sendiri.

## Sumber Data Rujukan Pertumbuhan WHO

Kurva rujukan pada halaman grafik pertumbuhan (median, -2SD, +2SD untuk
berat-menurut-usia dan tinggi-menurut-usia) memakai NILAI PENDEKATAN yang
diambil dari 12 titik usia acuan (0, 1, 2, 3, 6, 9, 12, 18, 24, 36, 48, 60
bulan) yang umum dikutip dari WHO Child Growth Standards (2006), laki-laki
dan perempuan terpisah, dengan interpolasi linear untuk usia di antara
titik-titik tersebut. Sesi pengembangan aplikasi ini tidak berhasil mengambil
tabel resmi lengkap langsung dari who.int, sehingga dipakai nilai pendekatan
yang dikenal luas ini sebagai gantinya.

Nilai ini BUKAN salinan presisi tinggi dari tabel resmi WHO dan TIDAK BOLEH
dipakai sebagai dasar keputusan klinis. Untuk kebutuhan klinis, verifikasi ke
tabel resmi di who.int/tool/child-growth-standards. Catatan ini juga
ditampilkan langsung pada halaman grafik pertumbuhan di aplikasi, dan detail
angkanya beserta alasannya ada di `lib/whoReference.js`.

## Kejujuran soal Notifikasi

Halaman "Pengingat" menampilkan catatan in-app yang dibuat oleh job
pengingat. Aplikasi ini TIDAK terhubung ke layanan pengiriman pesan nyata
apa pun (bukan SMS, bukan WhatsApp, bukan email). Kader perlu menyampaikan
pengingat tersebut secara manual, misalnya dengan mencetak atau menunjukkan
halaman tersebut saat bertemu keluarga terkait. Lihat `PRD.md` bagian
Non-Fungsional untuk rincian lebih lanjut.

## Verifikasi

Hasil pengujian manual (alur data, grafik, imunisasi, dan pengingat) dicatat
di `VERIFICATION.md`.
