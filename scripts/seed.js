// Mengisi data contoh (seed) untuk demo/pengujian lokal.
//
// PENTING: seluruh nama dan tanggal lahir di bawah ini adalah DATA UJI fiktif,
// ditandai jelas dengan label "(Data Uji)" pada nama, BUKAN data balita nyata
// dan bukan rekam kesehatan sungguhan. Jangan gunakan skrip ini untuk membuat
// data yang terlihat seperti rekam medis asli.
//
// Jalankan: npm run seed
// Skrip ini menimpa data/*.json yang ada. Jangan jalankan pada data produksi.

const fs = require('fs');
const path = require('path');
const store = require('../lib/store');

const DATA_DIR = path.join(__dirname, '..', 'data');

function bersihkan() {
  ['keluarga', 'balita', 'pengukuran', 'imunisasiStatus', 'notifikasi', 'pengaturan'].forEach((nama) => {
    const file = path.join(DATA_DIR, `${nama}.json`);
    if (fs.existsSync(file)) fs.unlinkSync(file);
  });
}

function tanggalMinusBulan(bulan) {
  const d = new Date();
  d.setMonth(d.getMonth() - bulan);
  return d.toISOString().slice(0, 10);
}

bersihkan();

store.simpanTunggal('pengaturan', 'umum', {
  namaPosyandu: 'Posyandu Contoh (Data Uji)',
  tanggalRutinPosyandu: 10,
  updatedAt: new Date().toISOString(),
});

const keluarga1 = store.tambah('keluarga', {
  namaKepalaKeluarga: 'Contoh Kepala Keluarga Satu (Data Uji)',
  alamat: 'Jl. Contoh Uji No. 1, RT 001/RW 002',
  rtRw: '001/002',
  noHp: '0800000000',
  aktif: true,
  createdAt: new Date().toISOString(),
});

const keluarga2 = store.tambah('keluarga', {
  namaKepalaKeluarga: 'Contoh Kepala Keluarga Dua (Data Uji)',
  alamat: 'Jl. Contoh Uji No. 2, RT 003/RW 002',
  rtRw: '003/002',
  noHp: '0800000001',
  aktif: true,
  createdAt: new Date().toISOString(),
});

const balita1 = store.tambah('balita', {
  keluargaId: keluarga1.id,
  nama: 'Contoh Balita Satu (Data Uji)',
  tanggalLahir: tanggalMinusBulan(14),
  jenisKelamin: 'L',
  createdAt: new Date().toISOString(),
});

const balita2 = store.tambah('balita', {
  keluargaId: keluarga2.id,
  nama: 'Contoh Balita Dua (Data Uji)',
  tanggalLahir: tanggalMinusBulan(7),
  jenisKelamin: 'P',
  createdAt: new Date().toISOString(),
});

// Riwayat pengukuran contoh, beberapa titik usia berbeda, nilai wajar
// (dalam rentang -2SD s.d. +2SD pendekatan WHO) supaya grafik contoh masuk akal.
[0, 3, 6, 9, 12].forEach((usiaBulanLalu) => {
  const bulanSejakSekarang = 14 - usiaBulanLalu;
  if (bulanSejakSekarang < 0) return;
  store.tambah('pengukuran', {
    balitaId: balita1.id,
    tanggalUkur: tanggalMinusBulan(bulanSejakSekarang),
    beratKg: [3.4, 6.2, 7.8, 8.6, 9.4][[0, 3, 6, 9, 12].indexOf(usiaBulanLalu)],
    tinggiCm: [50.5, 61.0, 67.0, 71.5, 75.0][[0, 3, 6, 9, 12].indexOf(usiaBulanLalu)],
    lingkarKepalaCm: [35.0, 40.5, 43.0, 44.5, 45.5][[0, 3, 6, 9, 12].indexOf(usiaBulanLalu)],
    catatan: '',
    createdAt: new Date().toISOString(),
  });
});

[0, 3, 6].forEach((usiaBulanLalu) => {
  const bulanSejakSekarang = 7 - usiaBulanLalu;
  if (bulanSejakSekarang < 0) return;
  store.tambah('pengukuran', {
    balitaId: balita2.id,
    tanggalUkur: tanggalMinusBulan(bulanSejakSekarang),
    beratKg: [3.1, 5.6, 7.1][[0, 3, 6].indexOf(usiaBulanLalu)],
    tinggiCm: [49.0, 58.5, 64.5][[0, 3, 6].indexOf(usiaBulanLalu)],
    lingkarKepalaCm: [34.0, 39.5, 42.0][[0, 3, 6].indexOf(usiaBulanLalu)],
    catatan: '',
    createdAt: new Date().toISOString(),
  });
});

// Tandai satu imunisasi awal sudah diberikan untuk balita 1, sisanya biarkan
// terhitung otomatis (belum/jatuh tempo/terlambat) oleh lib/imunisasi.js.
store.tambah('imunisasiStatus', {
  balitaId: balita1.id,
  kodeImunisasi: 'HB0',
  status: 'sudah',
  tanggalPemberian: tanggalMinusBulan(14),
  updatedAt: new Date().toISOString(),
});
store.tambah('imunisasiStatus', {
  balitaId: balita1.id,
  kodeImunisasi: 'BCG',
  status: 'sudah',
  tanggalPemberian: tanggalMinusBulan(13),
  updatedAt: new Date().toISOString(),
});

console.log('Data contoh (data uji) berhasil dibuat:');
console.log('- 2 keluarga, 2 balita, riwayat pengukuran, pengaturan posyandu.');
console.log('- Jalankan "npm start" lalu buka http://localhost:3000');
console.log('- Jalankan "npm run cron:jalankan-sekali" untuk menguji pembuatan pengingat.');
