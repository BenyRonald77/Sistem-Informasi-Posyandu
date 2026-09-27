// Nilai rujukan pertumbuhan anak.
//
// PENTING - BACA INI SEBELUM MENGUBAH ANGKA DI BAWAH:
// Angka pada tabel ini adalah NILAI PENDEKATAN (median dan +-2SD) yang diambil
// dari titik-titik usia yang umum dikutip dari WHO Child Growth Standards
// (2006) untuk berat-menurut-usia (weight-for-age) dan panjang/tinggi-menurut-
// usia (length/height-for-age), usia 0-60 bulan, laki-laki dan perempuan
// terpisah. Sesi kerja ini tidak berhasil mengambil tabel resmi WHO secara
// langsung dari who.int (tidak ada akses jaringan yang berhasil ke sumber
// tersebut saat aplikasi ini dibangun), sehingga dipakai nilai pendekatan yang
// dikenal luas pada 12 titik usia (0,1,2,3,6,9,12,18,24,36,48,60 bulan), dan
// usia di antaranya dihitung dengan interpolasi linear di modul ini.
//
// AKIBATNYA:
// - Nilai ini BUKAN salinan presisi tinggi dari tabel resmi WHO per bulan.
// - Nilai ini TIDAK BOLEH dipakai sebagai dasar keputusan klinis/diagnosis.
// - Untuk keperluan klinis, verifikasi ke tabel resmi WHO Child Growth
//   Standards di who.int/tool/child-growth-standards.
// - Nilai ini hanya untuk keperluan VISUALISASI perkiraan posisi pertumbuhan
//   balita relatif terhadap rentang wajar, sebagai bahan diskusi kader dengan
//   orang tua, bukan alat diagnosis.
//
// Catatan ini WAJIB tetap ditampilkan di halaman grafik pertumbuhan (lihat
// routes/grafik.js dan views/grafik/tampil.ejs), tidak cukup hanya di sini.

const TITIK_USIA_BULAN = [0, 1, 2, 3, 6, 9, 12, 18, 24, 36, 48, 60];

// Berat badan (kg): median, -2SD, +2SD
const BERAT = {
  L: {
    median: [3.3, 4.5, 5.6, 6.4, 7.9, 8.9, 9.6, 10.9, 12.2, 14.3, 16.3, 18.3],
    sdMinus2: [2.5, 3.4, 4.3, 5.0, 6.4, 7.1, 7.7, 8.8, 9.7, 11.3, 12.7, 14.1],
    sdPlus2: [4.4, 5.8, 7.1, 7.9, 9.8, 11.0, 11.8, 13.7, 15.3, 18.3, 21.2, 24.2],
  },
  P: {
    median: [3.2, 4.2, 5.1, 5.8, 7.3, 8.2, 8.9, 10.2, 11.5, 13.9, 16.1, 18.2],
    sdMinus2: [2.4, 3.2, 3.9, 4.5, 5.7, 6.3, 6.9, 7.9, 8.6, 10.8, 12.3, 13.7],
    sdPlus2: [4.2, 5.5, 6.6, 7.5, 9.3, 10.5, 11.5, 13.2, 14.8, 18.1, 21.5, 24.9],
  },
};

// Panjang/tinggi badan (cm): median, -2SD, +2SD
const TINGGI = {
  L: {
    median: [49.9, 54.7, 58.4, 61.4, 67.6, 72.0, 75.7, 82.3, 87.1, 96.1, 103.3, 110.0],
    sdMinus2: [46.1, 50.8, 54.4, 57.3, 63.3, 67.5, 71.0, 76.9, 81.0, 88.7, 94.9, 100.7],
    sdPlus2: [53.7, 58.6, 62.4, 65.5, 71.9, 76.5, 80.5, 87.7, 93.2, 103.5, 111.7, 119.2],
  },
  P: {
    median: [49.1, 53.7, 57.1, 59.8, 65.7, 70.1, 74.0, 80.7, 85.7, 95.1, 102.7, 109.4],
    sdMinus2: [45.4, 49.8, 53.0, 55.6, 61.2, 65.3, 68.9, 74.9, 79.3, 87.4, 94.1, 99.9],
    sdPlus2: [52.9, 57.6, 61.1, 64.0, 70.3, 74.9, 79.2, 86.5, 92.0, 102.7, 111.3, 118.9],
  },
};

function interpolasiLinear(usiaBulan, tabelNilai) {
  const titik = TITIK_USIA_BULAN;
  if (usiaBulan <= titik[0]) return tabelNilai[0];
  if (usiaBulan >= titik[titik.length - 1]) return tabelNilai[tabelNilai.length - 1];
  for (let i = 0; i < titik.length - 1; i += 1) {
    const x0 = titik[i];
    const x1 = titik[i + 1];
    if (usiaBulan >= x0 && usiaBulan <= x1) {
      const y0 = tabelNilai[i];
      const y1 = tabelNilai[i + 1];
      const rasio = x1 === x0 ? 0 : (usiaBulan - x0) / (x1 - x0);
      return Math.round((y0 + (y1 - y0) * rasio) * 100) / 100;
    }
  }
  return tabelNilai[tabelNilai.length - 1];
}

// Menghasilkan deret titik referensi (untuk digambar sebagai garis/pita) pada
// resolusi bulan bulat 0..maksUsiaBulan, supaya kurva halus.
function deretReferensi(jenis, jenisKelamin, maksUsiaBulan = 60) {
  const tabel = jenis === 'berat' ? BERAT : TINGGI;
  const data = tabel[jenisKelamin];
  if (!data) return null;
  const hasil = { usiaBulan: [], median: [], sdMinus2: [], sdPlus2: [] };
  for (let bulan = 0; bulan <= maksUsiaBulan; bulan += 1) {
    hasil.usiaBulan.push(bulan);
    hasil.median.push(interpolasiLinear(bulan, data.median));
    hasil.sdMinus2.push(interpolasiLinear(bulan, data.sdMinus2));
    hasil.sdPlus2.push(interpolasiLinear(bulan, data.sdPlus2));
  }
  return hasil;
}

const CATATAN_SUMBER =
  'Kurva rujukan ini adalah nilai pendekatan (median, -2SD, +2SD) dari WHO ' +
  'Child Growth Standards (2006) pada 12 titik usia acuan, diinterpolasi ' +
  'linear untuk usia di antaranya. Bukan salinan presisi tinggi tabel resmi ' +
  'WHO, dan tidak boleh dipakai sebagai dasar keputusan klinis. Untuk ' +
  'keperluan klinis, verifikasi ke who.int/tool/child-growth-standards.';

module.exports = {
  TITIK_USIA_BULAN,
  BERAT,
  TINGGI,
  interpolasiLinear,
  deretReferensi,
  CATATAN_SUMBER,
};
