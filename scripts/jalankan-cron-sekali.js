// Memicu job pengingat secara manual, satu kali, tanpa menunggu jadwal cron
// asli. Dipakai untuk verifikasi (lihat VERIFICATION.md) dan bisa dipakai
// kader/pengelola bila ingin memaksa pembuatan pengingat hari ini juga.
//
// Jalankan: npm run cron:jalankan-sekali

const { jalankanSemuaPengingat } = require('../lib/pengingat');

const hasil = jalankanSemuaPengingat();

console.log('=== Hasil jalankan pengingat manual ===');
console.log('Waktu jalan   :', hasil.waktuJalan);
console.log('Tanggal acuan :', hasil.tanggalAcuan);
console.log('--- Posyandu ---');
console.log('Notifikasi dibuat:', hasil.posyandu.dibuat);
console.log('Keterangan       :', hasil.posyandu.alasan);
console.log('--- Imunisasi ---');
console.log('Notifikasi dibuat:', hasil.imunisasi.dibuat);
if (hasil.imunisasi.rincian.length) {
  console.log('Rincian:');
  hasil.imunisasi.rincian.forEach((r) => console.log(' -', r));
}
