const express = require('express');
const store = require('../lib/store');

const router = express.Router();

router.get('/', (req, res, next) => {
  try {
    const keluarga = store.bacaSemua('keluarga');
    const balita = store.bacaSemua('balita');
    const keluargaAktif = keluarga.filter((k) => k.aktif !== false);

    res.render('dashboard', {
      title: 'Dashboard',
      jumlahKeluarga: keluargaAktif.length,
      jumlahBalita: balita.length,
      adaData: keluarga.length > 0 || balita.length > 0,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
