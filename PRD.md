# PRD - Sistem Informasi Posyandu

## 1. Ringkasan

Sistem Informasi Posyandu adalah aplikasi web untuk membantu kader posyandu
mencatat data keluarga dan balita, mencatat hasil pengukuran pertumbuhan tiap
kunjungan, memantau pertumbuhan balita terhadap standar WHO, mengelola status
imunisasi dasar, dan menyiapkan pengingat menjelang jadwal posyandu bulanan
maupun imunisasi yang jatuh tempo. Aplikasi ini berjalan sebagai aplikasi web
tunggal (Node.js + Express + EJS) dengan penyimpanan data berbasis berkas JSON
lokal, ditujukan untuk dipakai di satu posyandu atau dijalankan lokal oleh
kader/pengelola.

## 2. Latar Belakang

Pencatatan posyandu secara manual (buku KMS/KIA kertas) menyulitkan kader
untuk melihat tren pertumbuhan balita secara cepat, mengingat jadwal imunisasi
tiap anak yang berbeda-beda usianya, dan mengingatkan orang tua menjelang
jadwal posyandu bulanan. Banyak sistem digital posyandu yang ada bersifat
tertutup/berbayar. Aplikasi ini dibangun sebagai alat bantu sederhana yang bisa
dijalankan sendiri oleh posyandu tanpa biaya layanan pihak ketiga.

## 3. Tujuan

1. Memudahkan kader mencatat data keluarga dan balita beserta riwayat
   pengukuran rutin (berat, tinggi/panjang, lingkar kepala).
2. Menampilkan grafik pertumbuhan tiap balita yang dioverlay dengan kurva
   rujukan standar pertumbuhan WHO, sesuai jenis kelamin.
3. Menghasilkan daftar imunisasi dasar otomatis sesuai usia balita, dan
   mencatat status pemberiannya.
4. Menyiapkan pengingat (in-app) menjelang jadwal posyandu bulanan dan
   imunisasi yang jatuh tempo, yang bisa ditunjukkan/dicetak kader ke orang
   tua saat kunjungan atau melalui saluran komunikasi kader sendiri (bukan
   pengiriman otomatis ke perangkat orang tua).

## 4. Peran Pengguna

- **Kader Posyandu / Admin** - pengguna utama sistem. Login tidak diwajibkan
  pada versi ini (aplikasi single-tenant untuk satu posyandu berjalan lokal);
  kader mengoperasikan seluruh menu: data keluarga, balita, pengukuran,
  imunisasi, pengaturan jadwal, dan melihat daftar pengingat.
- **Orang Tua Balita** - penerima informasi dan pengingat. Tidak mengakses
  sistem secara langsung pada versi ini; menerima informasi pertumbuhan anak
  dan pengingat jadwal melalui kader (dicetak/ditunjukkan dari halaman
  "Pengingat untuk Orang Tua"), bukan melalui login mandiri atau notifikasi
  otomatis ke HP.

## 5. Ruang Lingkup

**Termasuk (dalam versi ini):**
- CRUD data keluarga dan balita.
- Pencatatan riwayat pengukuran per kunjungan (berat, tinggi/panjang, lingkar
  kepala) per balita.
- Grafik pertumbuhan berat-menurut-usia dan tinggi-menurut-usia dengan pita
  rujukan WHO (median, -2SD, +2SD) sesuai jenis kelamin.
- Master jadwal imunisasi dasar program pemerintah Indonesia, generate daftar
  imunisasi otomatis per balita sesuai usia, pencatatan status per imunisasi.
- Pengaturan tanggal posyandu bulanan rutin.
- Job terjadwal (cron) yang membuat notifikasi in-app: H-3 posyandu bulanan
  untuk semua keluarga aktif, dan untuk imunisasi jatuh tempo dalam 14 hari
  yang belum diberikan.
- Halaman "Pengingat untuk Orang Tua" (daftar notifikasi in-app, bisa dicetak).
- Dashboard ringkas.

**Tidak termasuk (di luar lingkup versi ini):**
- Pengiriman notifikasi nyata via SMS/WhatsApp/email/push ke perangkat orang
  tua (lihat bagian Non-Fungsional soal kejujuran ini).
- Login/otentikasi multi-pengguna, multi-posyandu (multi-tenant), atau
  peran berjenjang (misal Puskesmas mengelola banyak posyandu).
- Diagnosis atau keputusan klinis otomatis (misal status gizi buruk yang
  memicu rujukan medis) - sistem hanya menampilkan posisi ukur anak relatif
  terhadap pita rujukan WHO sebagai bahan diskusi kader, bukan diagnosis.

## 6. User Stories

1. Sebagai kader, saya ingin mendaftarkan keluarga baru beserta balitanya,
   supaya data tercatat sebelum kunjungan pertama.
2. Sebagai kader, saya ingin mencatat hasil ukur (berat, tinggi, lingkar
   kepala) tiap kali balita datang ke posyandu, supaya riwayat pertumbuhannya
   tersimpan berurutan.
3. Sebagai kader, saya ingin melihat grafik pertumbuhan balita dibandingkan
   kurva rujukan WHO, supaya saya bisa melihat apakah pertumbuhannya berada
   dalam rentang wajar atau perlu perhatian lebih.
4. Sebagai kader, saya ingin sistem otomatis menampilkan imunisasi apa saja
   yang seharusnya sudah/akan diberikan sesuai usia balita, supaya saya tidak
   perlu menghafal jadwal imunisasi dasar lengkap satu per satu.
5. Sebagai kader, saya ingin mencatat status dan tanggal pemberian tiap
   imunisasi, supaya riwayat imunisasi balita tercatat rapi.
6. Sebagai kader, saya ingin melihat daftar pengingat (posyandu bulanan yang
   akan datang, imunisasi yang jatuh tempo) dalam satu halaman yang bisa saya
   tunjukkan atau cetak untuk disampaikan ke orang tua, supaya saya tidak
   mengandalkan ingatan saya sendiri.
7. Sebagai kader, saya ingin mengatur tanggal rutin posyandu bulanan, supaya
   pengingat H-3 dihitung dari tanggal yang benar.
8. Sebagai orang tua (secara tidak langsung, lewat kader), saya ingin
   diingatkan sebelum jadwal posyandu dan sebelum imunisasi anak saya jatuh
   tempo, supaya saya tidak melewatkan jadwal tersebut.

## 7. Functional Requirements

### Manajemen Keluarga & Balita
- **FR-1** Sistem harus menyediakan CRUD data keluarga: nama kepala keluarga,
  alamat, RT/RW (opsional), nomor HP (opsional).
- **FR-2** Sistem harus menyediakan CRUD data balita yang terhubung ke satu
  keluarga: nama, tanggal lahir, jenis kelamin (laki-laki/perempuan).
- **FR-3** Sistem harus menghitung dan menampilkan usia balita dalam bulan
  (dibulatkan) berdasarkan tanggal lahir dan tanggal berjalan.
- **FR-4** Sistem harus menghapus data balita hanya bila kader mengonfirmasi,
  dan menampilkan balita dalam daftar keluarganya.

### Pengukuran Pertumbuhan
- **FR-5** Sistem harus menyediakan form input pengukuran per kunjungan:
  tanggal ukur, berat badan (kg), panjang/tinggi badan (cm), lingkar kepala
  (cm, opsional).
- **FR-6** Sistem harus menyimpan riwayat pengukuran per balita dan
  menampilkannya terurut kronologis (tanggal ukur menaik).
- **FR-7** Sistem harus mencegah penyimpanan pengukuran dengan nilai di luar
  rentang wajar (validasi dasar: angka positif, berat 0-40 kg, tinggi
  20-150 cm) dan menampilkan pesan kesalahan yang jelas bila gagal.

### Grafik Pertumbuhan (Standar WHO)
- **FR-8** Sistem harus menyediakan tabel referensi pendekatan standar
  pertumbuhan WHO (median, -2SD, +2SD) untuk berat-menurut-usia dan
  tinggi/panjang-menurut-usia, usia 0-60 bulan, terpisah laki-laki dan
  perempuan, pada titik usia 0,1,2,3,6,9,12,18,24,36,48,60 bulan, dengan
  interpolasi linear untuk usia di antaranya.
- **FR-9** Sistem harus menampilkan halaman grafik per balita yang meng-overlay
  titik hasil pengukuran nyata balita tersebut (usia dalam bulan pada sumbu X)
  dengan pita rujukan WHO sesuai jenis kelamin balita, untuk berat-menurut-usia
  dan tinggi-menurut-usia (dua grafik).
- **FR-10** Sistem harus menampilkan catatan sumber dan keterbatasan presisi
  data WHO yang dipakai secara eksplisit pada halaman grafik itu sendiri
  (bukan hanya di dokumen), termasuk anjuran verifikasi ke tabel resmi WHO
  untuk keputusan klinis.
- **FR-11** Sistem harus menyediakan endpoint data JSON untuk grafik (titik
  referensi WHO dan titik pengukuran anak) agar dapat diverifikasi terpisah
  dari tampilan.

### Imunisasi
- **FR-12** Sistem harus menyimpan master jadwal imunisasi dasar program
  pemerintah Indonesia (kode, nama, usia rekomendasi dalam bulan).
- **FR-13** Sistem harus menghasilkan daftar imunisasi yang berlaku untuk tiap
  balita berdasarkan usianya saat ini (menunjukkan status belum waktunya,
  jatuh tempo dekat, terlambat, atau sudah diberikan).
- **FR-14** Sistem harus memungkinkan kader mencatat status imunisasi per
  balita per jenis imunisasi: belum/sudah, beserta tanggal pemberian bila
  sudah.
- **FR-15** Sistem harus menampilkan ringkasan status imunisasi (jumlah
  sudah/belum/terlambat) per balita.

### Pengaturan & Pengingat Otomatis
- **FR-16** Sistem harus menyediakan pengaturan tanggal rutin posyandu bulanan
  (angka tanggal 1-28) dan nama/lokasi posyandu.
- **FR-17** Sistem harus menjalankan job terjadwal (node-cron) yang, saat
  dijalankan (baik oleh jadwal maupun dipicu manual untuk pengujian), membuat
  satu notifikasi in-app per keluarga aktif ketika hari ini tepat H-3 dari
  tanggal posyandu bulanan berikutnya.
- **FR-18** Job yang sama harus membuat satu notifikasi in-app per balita
  untuk tiap imunisasi yang jatuh tempo dalam 14 hari ke depan dan belum
  berstatus sudah diberikan.
- **FR-19** Sistem harus menyediakan cara memicu job pengingat secara manual
  di luar jadwal cron (skrip `npm run cron:jalankan-sekali`) untuk keperluan
  pengujian tanpa menunggu jadwal asli.
- **FR-20** Sistem harus menyimpan notifikasi pada koleksi `notifikasi` dan
  menampilkannya pada halaman "Pengingat untuk Orang Tua", termasuk tanggal
  dibuat dan status sudah dibaca/belum.
- **FR-21** Sistem harus menampilkan secara jujur pada halaman pengingat bahwa
  notifikasi ini adalah catatan in-app yang perlu disampaikan secara manual
  oleh kader (misal dicetak atau ditunjukkan/dibacakan), bukan pesan yang
  benar-benar terkirim otomatis ke HP orang tua.
- **FR-22** Sistem tidak boleh menampilkan atau mengklaim status "terkirim ke
  WhatsApp/SMS/email" untuk notifikasi apa pun, karena tidak ada integrasi ke
  layanan pengiriman nyata pada versi ini.

### Dashboard
- **FR-23** Sistem harus menampilkan dashboard ringkas: jumlah balita aktif,
  jumlah keluarga, jumlah pengingat yang belum dibaca, dan ringkasan status
  imunisasi (jumlah balita dengan imunisasi terlambat).

## 8. Data Model

### Keluarga
| Field | Tipe | Keterangan |
|---|---|---|
| id | string (UUID) | primary key |
| namaKepalaKeluarga | string | wajib |
| alamat | string | wajib |
| rtRw | string | opsional |
| noHp | string | opsional, hanya untuk catatan kader, tidak dipakai mengirim pesan otomatis |
| aktif | boolean | default true |
| createdAt | string (ISO datetime) | |

### Balita
| Field | Tipe | Keterangan |
|---|---|---|
| id | string (UUID) | primary key |
| keluargaId | string | FK ke Keluarga |
| nama | string | wajib |
| tanggalLahir | string (YYYY-MM-DD) | wajib |
| jenisKelamin | enum L/P | wajib |
| createdAt | string (ISO datetime) | |

### Pengukuran
| Field | Tipe | Keterangan |
|---|---|---|
| id | string (UUID) | primary key |
| balitaId | string | FK ke Balita |
| tanggalUkur | string (YYYY-MM-DD) | wajib |
| beratKg | number | wajib |
| tinggiCm | number | wajib |
| lingkarKepalaCm | number \| null | opsional |
| catatan | string | opsional |
| createdAt | string (ISO datetime) | |

### ImunisasiStatus
| Field | Tipe | Keterangan |
|---|---|---|
| id | string (UUID) | primary key |
| balitaId | string | FK ke Balita |
| kodeImunisasi | string | merujuk ke master jadwal imunisasi (di kode, bukan JSON) |
| status | enum belum/sudah | default belum |
| tanggalPemberian | string (YYYY-MM-DD) \| null | terisi bila status sudah |
| updatedAt | string (ISO datetime) | |

### Pengaturan
| Field | Tipe | Keterangan |
|---|---|---|
| id | string tetap "umum" | single-document |
| namaPosyandu | string | |
| tanggalRutinPosyandu | number (1-28) | tanggal tiap bulan |
| updatedAt | string (ISO datetime) | |

### Notifikasi
| Field | Tipe | Keterangan |
|---|---|---|
| id | string (UUID) | primary key |
| tipe | enum posyandu/imunisasi | |
| keluargaId | string \| null | terisi untuk tipe posyandu |
| balitaId | string \| null | terisi untuk tipe imunisasi |
| judul | string | |
| pesan | string | |
| tanggalDibuat | string (ISO datetime) | |
| sudahDibaca | boolean | default false |

## 9. Non-Fungsional

- **Akurasi grafik pertumbuhan**: nilai rujukan WHO yang disematkan adalah
  nilai pendekatan (median dan +-2SD) dari WHO Child Growth Standards (2006)
  pada titik usia tertentu, diinterpolasi linear untuk usia di antaranya.
  Ini BUKAN salinan tabel resmi WHO dengan presisi penuh, dan tidak boleh
  dipakai sebagai dasar keputusan klinis - sistem menyatakan hal ini secara
  eksplisit di halaman grafik. Untuk kebutuhan klinis, kader/tenaga kesehatan
  disarankan memverifikasi ke tabel resmi WHO (who.int/tool/child-growth-standards).
- **Penjadwalan cron**: job pengingat berjalan terjadwal (harian) melalui
  node-cron, dan harus dapat dipicu manual (`npm run cron:jalankan-sekali`)
  untuk verifikasi tanpa menunggu jadwal asli berjalan.
- **Aksesibilitas**: kontras teks memenuhi WCAG AA (4.5:1 teks normal, 3:1
  teks besar), seluruh elemen interaktif dapat dioperasikan dengan keyboard,
  target sentuh minimal 44px, tanpa horizontal overflow di layar kecil.
- **Kejujuran notifikasi**: sistem tidak pernah mengklaim notifikasi
  "terkirim" ke perangkat orang tua. Semua notifikasi berlabel sebagai catatan
  in-app yang perlu disampaikan manual oleh kader.
- **Tanpa metrik rekaan**: aplikasi tidak menampilkan statistik penggunaan,
  testimoni, atau klaim keberhasilan program yang tidak berasal dari data
  yang benar-benar tersimpan di sistem ini.

## 10. Batasan & Asumsi

- Aplikasi diasumsikan dipakai oleh satu posyandu (single-tenant), tanpa
  sistem login berjenjang pada versi ini.
- Data pengukuran contoh (seed) yang disertakan aplikasi memakai nama dan
  tanggal lahir fiktif yang jelas berupa data uji, bukan data balita nyata.
- Nilai referensi pertumbuhan WHO memakai pendekatan interpolasi 12 titik
  usia, bukan tabel resmi lengkap per bulan/per minggu.
- Penyimpanan data memakai berkas JSON lokal (bukan basis data server),
  sehingga cocok untuk skala satu posyandu, bukan skala kabupaten/multi-tenant.
- Tidak ada integrasi pengiriman pesan nyata (SMS/WhatsApp/email) pada versi
  ini; seluruh "pengingat" bersifat catatan in-app.
