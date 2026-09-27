const express = require('express');
const store = require('../lib/store');
const { generateDaftarImunisasi } = require('../lib/imunisasi');

const router = express.Router();

router.get('/', (req, res, next) => {
  try {
    const keluarga = store.bacaSemua('keluarga');
    const balita = store.bacaSemua('balita');
    const statusImunisasi = store.bacaSemua('imunisasiStatus');
    const keluargaAktif = keluarga.filter((k) => k.aktif !== false);

    let jumlahBalitaTerlambatImunisasi = 0;
    balita.forEach((b) => {
      const statusBalita = statusImunisasi.filter((s) => s.balitaId === b.id);
      const daftar = generateDaftarImunisasi(b, statusBalita);
      if (daftar.some((item) => item.statusTampil === 'terlambat')) {
        jumlahBalitaTerlambatImunisasi += 1;
      }
    });

    res.render('dashboard', {
      title: 'Dashboard',
      jumlahKeluarga: keluargaAktif.length,
      jumlahBalita: balita.length,
      jumlahBalitaTerlambatImunisasi,
      adaData: keluarga.length > 0 || balita.length > 0,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
