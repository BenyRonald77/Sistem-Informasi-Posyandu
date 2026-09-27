// Penjadwalan job pengingat harian memakai node-cron.
// Job ini memanggil logika yang sama dengan skrip pemicu manual
// (scripts/jalankan-cron-sekali.js dan npm run cron:jalankan-sekali), supaya
// bisa diverifikasi tanpa menunggu jadwal asli.

const cron = require('node-cron');
const { jalankanSemuaPengingat } = require('./pengingat');

let jobAktif = null;

// Berjalan setiap hari jam 06:00. Dipilih pagi hari supaya kader melihat
// pengingat baru sebelum jam kerja posyandu dimulai.
const JADWAL_HARIAN = '0 6 * * *';

function mulaiJobPengingat(logger = console) {
  if (jobAktif) return jobAktif;
  jobAktif = cron.schedule(JADWAL_HARIAN, () => {
    try {
      const hasil = jalankanSemuaPengingat();
      logger.log(`[cron pengingat] berjalan ${hasil.waktuJalan}: posyandu dibuat=${hasil.posyandu.dibuat}, imunisasi dibuat=${hasil.imunisasi.dibuat}`);
    } catch (err) {
      logger.error('[cron pengingat] gagal berjalan:', err.message);
    }
  });
  logger.log(`[cron pengingat] terjadwal harian (${JADWAL_HARIAN}). Untuk pengujian tanpa menunggu jadwal, jalankan: npm run cron:jalankan-sekali`);
  return jobAktif;
}

module.exports = { mulaiJobPengingat, JADWAL_HARIAN };
