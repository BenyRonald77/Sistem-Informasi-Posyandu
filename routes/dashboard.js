const express = require('express');
const store = require('../lib/store');
const { generateDaftarImunisasi } = require('../lib/imunisasi');
const { formatTanggalWaktu } = require('../lib/format');

const router = express.Router();

router.get('/', (req, res, next) => {
  try {
    const keluarga = store.bacaSemua('keluarga');
    const balita = store.bacaSemua('balita');
    const statusImunisasi = store.bacaSemua('imunisasiStatus');
    const notifikasi = store.bacaSemua('notifikasi');
    const keluargaAktif = keluarga.filter((k) => k.aktif !== false);
    const belumDibaca = notifikasi.filter((n) => !n.sudahDibaca);

    let jumlahBalitaTerlambatImunisasi = 0;
    balita.forEach((b) => {
      const statusBalita = statusImunisasi.filter((s) => s.balitaId === b.id);
      const daftar = generateDaftarImunisasi(b, statusBalita);
      if (daftar.some((item) => item.statusTampil === 'terlambat')) {
        jumlahBalitaTerlambatImunisasi += 1;
      }
    });

    const notifikasiTerbaru = [...notifikasi]
      .sort((a, b) => new Date(b.tanggalDibuat) - new Date(a.tanggalDibuat))
      .slice(0, 5);

    res.render('dashboard', {
      title: 'Dashboard',
      jumlahKeluarga: keluargaAktif.length,
      jumlahBalita: balita.length,
      jumlahNotifBelumDibaca: belumDibaca.length,
      jumlahBalitaTerlambatImunisasi,
      notifikasiTerbaru,
      adaData: keluarga.length > 0 || balita.length > 0,
      formatTanggalWaktu,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
