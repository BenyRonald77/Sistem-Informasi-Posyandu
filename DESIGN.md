# Arahan Desain - Sistem Informasi Posyandu

Catatan kejujuran (R-37): arahan ini dibuat oleh agen sendiri (opsi 2 wizard),
bukan dipasok oleh pemilik produk. Tidak ada brand guideline sebelumnya, jadi
arah di bawah adalah keputusan desain yang diambil sendiri, bukan fakta yang
diverifikasi pemilik produk. Jika pemilik produk punya identitas visual sendiri
untuk posyandu/puskesmas setempat, arahan ini bisa diganti.

## Baca desain (Design Read)

Membaca ini sebagai: aplikasi kerja lapangan untuk kader posyandu dan alat
pemantauan untuk orang tua balita, dengan bahasa visual pelayanan masyarakat
yang hangat tapi rapi (bukan gaya korporat kesehatan yang dingin, bukan pula
gaya startup AI generik). Dial: ENERGY 2 / RHYTHM 2 / MOTION 1.

- **ENERGY 2** - alasan: ini alat kerja harian kader, dipakai berulang-ulang
  sambil berdiri di meja posyandu. Terlalu kalem (ENERGY 1, gaya formulir
  pemerintah kaku) terasa membosankan dan sulit dipercaya sebagai produk yang
  "hidup"; terlalu ramai (ENERGY 3) mengganggu saat kader sedang mencatat data
  anak dengan cepat. Level tengah: rapi, ada kehangatan warna, tanpa drama.
- **RHYTHM 2** - alasan: halaman dashboard, halaman formulir data, dan halaman
  grafik punya kebutuhan tampilan yang berbeda (ringkasan vs input vs
  visualisasi), jadi komposisi antar halaman wajar berbeda. Tapi karena ini
  alat kerja yang harus cepat dipahami kader baru, pola dasar (posisi label,
  posisi tombol utama, struktur tabel) tetap konsisten, tidak "asimetris
  eksperimental" di tiap halaman.
- **MOTION 1** - alasan: ini konteks layanan kesehatan masyarakat, prioritas
  adalah kecepatan baca data dan keterpercayaan, bukan kesan "wah". Animasi
  dibatasi pada transisi hover/focus dan transisi state (tab, accordion),
  tanpa efek scroll-reveal atau paralaks.

## Palet warna

Maksimal 3 warna inti + 1 aksen (R-29). Warna netral (krem kertas, tinta,
abu-abu garis) tidak dihitung sebagai warna inti.

| Peran | Hex | Alasan |
|---|---|---|
| Inti 1 - Teal Posyandu (primer) | `#0F6E5C` | Hijau-teal tua dipilih karena diasosiasikan dengan kesehatan dan pertumbuhan (bukan biru korporat rumah sakit yang dingin, bukan hijau muda yang kekanak-kanakan). Dipakai untuk navigasi aktif, judul bagian, dan elemen struktural utama. |
| Inti 2 - Krem Kertas (latar) | `#FBF6EE` | Latar belakang hangat, bukan putih steril, meniru kesan kertas KMS/buku KIA yang biasa dipegang kader dan orang tua sehari-hari. Mengurangi kesan "aplikasi korporat dingin". |
| Inti 3 - Tinta Hangat (teks) | `#2B2420` | Coklat tua-kehitaman, bukan hitam pekat, supaya kontras tetap tinggi (di atas 4.5:1 pada latar krem) tapi terasa lebih hangat dibanding teks hitam murni khas dashboard SaaS. |
| Aksen - Terakota (tindakan/penting) | `#BB4C20` | Dipakai HANYA untuk tombol aksi utama, tanda "jatuh tempo"/perlu perhatian, dan sorot penting lain. Warna hangat (bukan merah alarm, bukan oranye neon) supaya terasa mengundang tindakan tanpa terkesan darurat/menakutkan bagi orang tua yang membaca pengingat imunisasi anaknya. Nilai disesuaikan dari draf awal (`#C4562A`) supaya teks putih di atasnya memenuhi kontras WCAG AA 4.5:1 (R-25). |

Warna status (fungsional, bukan dekoratif, mengikuti kebutuhan data, bukan
menambah jumlah warna inti karena tiap warna menandai kondisi nyata):
`--status-sudah` hijau `#1E7A34` (imunisasi sudah diberikan / gizi normal),
`--status-jatuh-tempo` terakota aksen di atas (jatuh tempo dekat),
`--status-terlambat` merah bata `#B23A2E` (imunisasi terlambat / hasil ukur
perlu perhatian), `--status-belum` abu netral gelap `#5C5548` (belum
waktunya, disesuaikan lebih gelap dari draf awal supaya teks badge tetap
lolos kontras AA di atas latar abu terangnya).

## Tipografi

- Judul (heading): tumpukan serif sistem `Georgia, "Times New Roman", serif`.
  Alasan: memberi kesan "dokumen resmi yang bisa dipercaya" (dekat dengan
  kesan buku KIA/rekam kesehatan cetak) tanpa memuat font eksternal (semua
  perangkat kader bisa jaringan lambat, jadi tanpa Google Fonts). Ini pilihan
  sadar untuk membedakan dari font sans generik AI (Inter/Geist) yang dipakai
  hampir semua produk.
- Isi (body): tumpukan sans sistem
  `-apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`.
  Alasan: keterbacaan tinggi di layar kecil untuk tabel pengukuran dan daftar
  imunisasi yang padat data, tanpa bergantung pada unduhan font.
- Angka pada tabel pengukuran/grafik memakai `font-variant-numeric: tabular-nums`
  supaya kolom angka (berat, tinggi) rata dan mudah dipindai kader.

## Motif identitas

Satu motif berulang: **garis lengkung tunggal** (satu kurva tipis, terinspirasi
kurva pertumbuhan) dipakai sebagai pemisah dekoratif tunggal di header halaman
dashboard dan sebagai aksen di kartu ringkasan, bukan grid titik atau gradient.
Dipakai sekali per halaman (bukan di semua kartu) supaya tetap jadi penanda,
bukan tempelan berulang tanpa arti (R-07, R-31).

## Radius, bayangan, dan komponen

- Radius kecil-menengah konsisten (`--radius-sm: 6px`, `--radius-md: 10px`),
  tidak ada elemen pil kecuali tombol status kecil (badge status imunisasi,
  karena itu memang berfungsi sebagai label kondisi, bukan dekorasi) (R-11).
- Bayangan dipakai HANYA pada kartu ringkasan dashboard dan modal, sebagai
  penanda elevasi bahwa itu bisa "diangkat"/adalah ringkasan, bukan default di
  semua elemen (R-12).
- Tanpa glassmorphism, tanpa glow, tanpa gradient dekoratif (R-01, R-10, R-13).

## Ikon

Tidak memakai pustaka ikon generik (Lucide dkk). Untuk kebutuhan penanda status
dipakai bentuk geometris sederhana (lingkaran terisi/kosong/silang tipis) yang
dibangun dari CSS/SVG inline dan diberi label teks di sampingnya, bukan simbol
mengambang tanpa teks (R-04, R-32 - status tidak boleh hanya warna/ikon).

## Grafik pertumbuhan (khusus, mengikuti skill dataviz)

- Pita rujukan WHO (median dan -2SD/+2SD) memakai warna biru kategori-1 skema
  dataviz (`#2a78d6` terang / disesuaikan gelap) dengan opacity rendah untuk
  pita SD, garis median lebih tegas.
- Titik hasil pengukuran anak memakai warna kategori-2 (oranye `#eb6834`),
  sengaja dipilih beda hue jauh dari biru referensi supaya jelas dibedakan
  penderita buta warna merah-hijau sekalipun (pasangan biru/oranye termasuk
  yang divalidasi aman di skill dataviz).
- Legenda selalu tampil (bukan hanya warna) karena ada lebih dari satu seri.

## Ringkasan dial

ENERGY 2 / RHYTHM 2 / MOTION 1 - lihat alasan di atas. Draft ini dibuat tanpa
arahan dari pemilik produk (R-37 opsi 2), sehingga bila brand posyandu asli
sudah punya identitas resmi, sesuaikan palet di atas dengan identitas
tersebut.
