const express = require('express');
const store = require('../lib/store');
const { formatTanggalWaktu } = require('../lib/format');
const { jalankanSemuaPengingat } = require('../lib/pengingat');

const router = express.Router();

router.get('/', (req, res, next) => {
  try {
    const semua = store.bacaSemua('notifikasi')
      .sort((a, b) => new Date(b.tanggalDibuat) - new Date(a.tanggalDibuat));
    res.render('notifikasi/daftar', {
      title: 'Pengingat untuk Orang Tua',
      daftar: semua,
      formatTanggalWaktu,
    });
  } catch (err) {
    next(err);
  }
});

router.post('/jalankan-sekarang', (req, res, next) => {
  try {
    jalankanSemuaPengingat();
    res.redirect('/notifikasi');
  } catch (err) {
    next(err);
  }
});

router.post('/:id/tandai-dibaca', (req, res, next) => {
  try {
    store.perbarui('notifikasi', req.params.id, { sudahDibaca: true });
    res.redirect('/notifikasi');
  } catch (err) {
    next(err);
  }
});

module.exports = router;
