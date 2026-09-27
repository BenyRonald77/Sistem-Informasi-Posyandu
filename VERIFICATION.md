# Catatan Verifikasi Manual

Diverifikasi pada lingkungan pengembangan lokal, Node.js v22.22.2, tanggal
sistem 27 September 2026. Semua pengujian dijalankan lewat `npm install`,
menjalankan server di latar belakang, lalu `curl` ke tiap endpoint (server
dimatikan lagi setelah selesai; folder `data/` dibersihkan sebelum dan
sesudah pengujian karena berisi data uji, bukan data untuk disimpan).

## 1. Instalasi

```
npm install
```
Hasil: berhasil, tidak ada error, `node_modules/` terisi sesuai
`package.json` (express, ejs, express-ejs-layouts, node-cron).

## 2. Server berjalan

```
node server.js
```
Hasil: `Sistem Informasi Posyandu berjalan di http://localhost:3000` dan
`[cron pengingat] terjadwal harian (0 6 * * *)...` tercetak, tanpa error di
console.

## 3. Manajemen keluarga dan balita (fitur 1)

- Dashboard kosong menampilkan state kosong "Belum ada data keluarga atau
  balita" dengan tombol aksi. PASS.
- `POST /keluarga` dengan data lengkap -> redirect ke `/keluarga/:id`, data
  tersimpan. PASS.
- `POST /balita` terhubung ke keluarga di atas, tanggal lahir wajar ->
  redirect ke `/balita/:id`. PASS.
- Dicatat 5 pengukuran pada usia 0, 3, 6, 9, 12 bulan (balita laki-laki lahir
  12 bulan sebelum tanggal sistem). Semua tersimpan (`HTTP 302` per
  permintaan), dan halaman detail balita menampilkan tabel riwayat pengukuran
  terurut kronologis dari usia termuda ke tertua (diperiksa lewat urutan
  tanggal pada HTML: September 2025 -> Desember 2025 -> Maret 2026 -> Juni
  2026 -> September 2026). PASS.
- Validasi: pengukuran berat `-5` ditolak (`HTTP 400`, pesan "harus berupa
  angka antara 0 dan 40 kg"). Balita dengan tanggal lahir 2099 ditolak
  (`HTTP 400`, pesan "tidak boleh di masa depan"). PASS.
- `GET /balita/tidak-ada-id` dan `GET /halaman-tidak-ada` -> `HTTP 404`
  dengan halaman error yang actionable (tombol kembali ke dashboard). PASS.

## 4. Grafik pertumbuhan standar WHO (fitur 2)

- `GET /balita/:id/grafik` -> `HTTP 200`, memuat catatan sumber dan
  keterbatasan data WHO langsung di halaman (bukan hanya di dokumen). PASS.
- `GET /balita/:id/grafik-data` (endpoint JSON) diperiksa dengan skrip Node
  kecil. Hasil untuk balita laki-laki usia 12 bulan dengan 5 titik
  pengukuran:
  - `titikPengukuran` berisi 5 entri, tiap entri punya `usiaBulan` yang benar
    (0, 3, 6, 9, 12) dan nilai berat/tinggi sesuai input. PASS.
  - Referensi berat-menurut-usia laki-laki pada usia 12 bulan (indeks ke-12
    dari deret 0-60 bulan): median 9.6 kg, -2SD 7.7 kg, +2SD 11.8 kg -
    seluruhnya masuk akal secara medis umum dan naik monoton terhadap usia.
    PASS.
  - Referensi tinggi-menurut-usia laki-laki pada usia 12 bulan: median
    75.7 cm, -2SD 71.0 cm, +2SD 80.5 cm. PASS.
  - Deret referensi memiliki 61 titik (usia 0 sampai 60 bulan berturutan),
    cukup untuk kurva halus di Chart.js. PASS.
  - Field `catatanSumber` terisi teks peringatan pendekatan data WHO. PASS.

## 5. Jadwal imunisasi dan pencatatan status (fitur 3)

- `GET /balita/:id/imunisasi` untuk balita usia 12 bulan -> `HTTP 200`,
  menampilkan 13 baris (seluruh master jadwal). Status yang tergenerate:
  11 baris berstatus "Terlambat" (seluruh imunisasi dengan usia rekomendasi
  <= 9 bulan, karena belum pernah dicatat sebagai sudah) dan 2 baris "Belum
  waktunya" (booster usia 18 bulan). Sesuai perhitungan usia. PASS.
- `POST /balita/:id/imunisasi/CAMPAK_MR` dengan `status=sudah` dan
  `tanggalPemberian=2026-07-01` -> redirect, dan halaman berikutnya
  menunjukkan baris Campak/MR berubah menjadi badge "Sudah diberikan" dengan
  tanggal "1 Juli 2026" (setelah perbaikan ini, hitungan ulang: 10 baris
  terlambat, 2 belum waktunya, 1 sudah - total tetap 13). PASS.
- Dashboard menampilkan "Balita dengan imunisasi terlambat" = 1 (sesuai
  balita uji yang masih punya imunisasi terlambat). PASS.

## 6. Pengingat otomatis (fitur 4)

### 6.a Uji logika H-3 posyandu dengan tanggal terkontrol

Karena tanggal sistem saat verifikasi (27 September 2026) tidak kebetulan
jatuh H-3 dari tanggal rutin posyandu yang diuji, logika inti
(`lib/pengingat.js`) diuji langsung dengan tanggal acuan yang disetel ke
kondisi H-3 (tidak mengubah jam sistem, hanya memanggil fungsi dengan
argumen tanggal, sesuai isi modul yang sama dipakai job maupun skrip
manual):

- Pengaturan: `tanggalRutinPosyandu = 10`. Tanggal acuan diset ke 7
  September 2026 (H-3 dari 10 September 2026).
- Hasil: `posyandu.dibuat = 2` (satu per keluarga aktif yang ada saat itu),
  `alasan: "H-3 menuju posyandu tanggal 2026-09-10."`. PASS.
- Dijalankan ulang dengan tanggal acuan yang sama: `posyandu.dibuat = 0`
  (deduplikasi bekerja, tidak ada notifikasi ganda untuk bulan yang sama).
  PASS.
- Pada pemanggilan yang sama, `imunisasi.dibuat = 19` notifikasi untuk
  imunisasi yang jatuh tempo/terlambat pada kedua balita uji saat itu,
  dengan rincian nama balita dan nama imunisasi tercetak di hasil. Uji ulang
  langsung setelahnya menghasilkan `imunisasi.dibuat = 0` (deduplikasi per
  balita+kode imunisasi bekerja). PASS.

### 6.b Uji `npm run cron:jalankan-sekali` dengan tanggal sistem sungguhan

```
npm run cron:jalankan-sekali
```
Hasil (tanggal sistem asli, 27 September 2026, `tanggalRutinPosyandu=10`):
```
--- Posyandu ---
Notifikasi dibuat: 0
Keterangan       : Bukan H-3 (posyandu berikutnya 13 hari lagi, tanggal 2026-10-10).
--- Imunisasi ---
Notifikasi dibuat: 10
Rincian: Rafi Uji Verifikasi - Hepatitis B (HB0), BCG, Polio Tetes 1-4,
DPT-HB-Hib 1-3, Polio Suntik (IPV) [seluruh imunisasi yang usia
rekomendasinya <= 9 bulan dan belum ditandai sudah; Campak/MR tidak muncul
lagi karena sudah ditandai sudah pada langkah 5].
```
Ini menunjukkan skrip manual berjalan dengan logika yang sama persis dengan
job terjadwal, dan dengan benar melaporkan alasan ketika bukan H-3 (bukan
diam-diam gagal). PASS.

### 6.c Notifikasi tampil di halaman in-app

- `GET /notifikasi` menampilkan 10 kartu notifikasi (sesuai jumlah yang
  dibuat pada langkah 6.b) dan menyertakan teks peringatan "BUKAN pesan yang
  otomatis terkirim" secara eksplisit di halaman. PASS.
- Dashboard menampilkan angka "Pengingat belum dibaca" yang sesuai. PASS.
- `POST /notifikasi/:id/tandai-dibaca` mengubah satu notifikasi menjadi
  status dibaca (kartu tampil pudar dengan label "sudah dibaca"). PASS.

## 7. Aksesibilitas warna (WCAG AA)

Kontras dihitung manual (rumus WCAG relative luminance) untuk seluruh
pasangan teks/latar yang dipakai di `public/css/style.css`. Ditemukan dua
pasangan di bawah 4.5:1 pada draf awal:

- Teks putih pada tombol aksen (`#C4562A`): kontras 4.46 (FAIL tipis).
  Diperbaiki menjadi `#BB4C20` (kontras 5.04 dengan teks putih).
- Teks badge "Belum waktunya" (`#8A8378` pada latar `#EFEAE0`): kontras 3.13
  (FAIL). Diperbaiki menjadi `#5C5548` (kontras 4.89).

Setelah perbaikan, seluruh pasangan teks/latar yang diperiksa (tinta di atas
kertas, warna primer di atas kertas/putih, keempat warna status di atas latar
masing-masing, teks navigasi putih di atas primer, teks muram) berada di atas
4.5:1 untuk teks normal. `DESIGN.md` diperbarui mencatat perubahan nilai ini
beserta alasannya.

## 8. Server dimatikan

Server dihentikan (`kill`) dan folder `data/` (hasil data uji verifikasi)
dihapus setelah seluruh pengujian selesai, karena folder ini tidak
disertakan ke git (lihat `.gitignore`) dan memang dimaksudkan dibuat ulang
oleh pengguna aplikasi (lewat pemakaian normal atau `npm run seed`).
