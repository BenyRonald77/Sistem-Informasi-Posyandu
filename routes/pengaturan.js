const express = require('express');
const store = require('../lib/store');

const router = express.Router();

const ID_PENGATURAN = 'umum';

function validasi(body) {
  const errors = [];
  const tanggal = parseInt(body.tanggalRutinPosyandu, 10);
  if (!body.namaPosyandu || !body.namaPosyandu.trim()) {
    errors.push('Nama posyandu wajib diisi.');
  }
  if (Number.isNaN(tanggal) || tanggal < 1 || tanggal > 28) {
    errors.push('Tanggal rutin posyandu harus angka antara 1 dan 28 (supaya berlaku di semua bulan).');
  }
  return errors;
}

router.get('/', (req, res, next) => {
  try {
    const pengaturan = store.ambilTunggal('pengaturan', ID_PENGATURAN);
    res.render('pengaturan/form', {
      title: 'Pengaturan Posyandu',
      pengaturan: pengaturan || { namaPosyandu: '', tanggalRutinPosyandu: '' },
      errors: [],
      tersimpan: false,
    });
  } catch (err) {
    next(err);
  }
});

router.post('/', (req, res, next) => {
  try {
    const errors = validasi(req.body);
    if (errors.length) {
      return res.status(400).render('pengaturan/form', {
        title: 'Pengaturan Posyandu', pengaturan: req.body, errors, tersimpan: false,
      });
    }
    const disimpan = store.simpanTunggal('pengaturan', ID_PENGATURAN, {
      namaPosyandu: req.body.namaPosyandu.trim(),
      tanggalRutinPosyandu: parseInt(req.body.tanggalRutinPosyandu, 10),
      updatedAt: new Date().toISOString(),
    });
    res.render('pengaturan/form', {
      title: 'Pengaturan Posyandu', pengaturan: disimpan, errors: [], tersimpan: true,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
