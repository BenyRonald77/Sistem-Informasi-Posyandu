const express = require('express');
const store = require('../lib/store');
const { formatTanggal } = require('../lib/format');

const router = express.Router();

function validasiKeluarga(body) {
  const errors = [];
  if (!body.namaKepalaKeluarga || !body.namaKepalaKeluarga.trim()) {
    errors.push('Nama kepala keluarga wajib diisi.');
  }
  if (!body.alamat || !body.alamat.trim()) {
    errors.push('Alamat wajib diisi.');
  }
  return errors;
}

router.get('/', (req, res, next) => {
  try {
    const semua = store.bacaSemua('keluarga');
    const balita = store.bacaSemua('balita');
    const daftar = semua
      .map((k) => ({ ...k, jumlahBalita: balita.filter((b) => b.keluargaId === k.id).length }))
      .sort((a, b) => a.namaKepalaKeluarga.localeCompare(b.namaKepalaKeluarga));
    res.render('keluarga/daftar', { title: 'Data Keluarga', daftar });
  } catch (err) {
    next(err);
  }
});

router.get('/baru', (req, res) => {
  res.render('keluarga/form', { title: 'Tambah Keluarga', keluarga: null, errors: [] });
});

router.post('/', (req, res, next) => {
  try {
    const errors = validasiKeluarga(req.body);
    if (errors.length) {
      return res.status(400).render('keluarga/form', { title: 'Tambah Keluarga', keluarga: req.body, errors });
    }
    const baru = store.tambah('keluarga', {
      namaKepalaKeluarga: req.body.namaKepalaKeluarga.trim(),
      alamat: req.body.alamat.trim(),
      rtRw: (req.body.rtRw || '').trim(),
      noHp: (req.body.noHp || '').trim(),
      aktif: true,
      createdAt: new Date().toISOString(),
    });
    res.redirect(`/keluarga/${baru.id}`);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', (req, res, next) => {
  try {
    const keluarga = store.cariById('keluarga', req.params.id);
    if (!keluarga) {
      return res.status(404).render('error', { title: 'Keluarga Tidak Ditemukan', pesan: 'Data keluarga yang dicari tidak ada atau sudah dihapus.', kodeStatus: 404 });
    }
    const daftarBalita = store.cariSemua('balita', (b) => b.keluargaId === keluarga.id);
    res.render('keluarga/detail', { title: keluarga.namaKepalaKeluarga, keluarga, daftarBalita, formatTanggal });
  } catch (err) {
    next(err);
  }
});

router.get('/:id/edit', (req, res, next) => {
  try {
    const keluarga = store.cariById('keluarga', req.params.id);
    if (!keluarga) {
      return res.status(404).render('error', { title: 'Keluarga Tidak Ditemukan', pesan: 'Data keluarga yang dicari tidak ada atau sudah dihapus.', kodeStatus: 404 });
    }
    res.render('keluarga/form', { title: 'Ubah Keluarga', keluarga, errors: [] });
  } catch (err) {
    next(err);
  }
});

router.post('/:id', (req, res, next) => {
  try {
    const keluarga = store.cariById('keluarga', req.params.id);
    if (!keluarga) {
      return res.status(404).render('error', { title: 'Keluarga Tidak Ditemukan', pesan: 'Data keluarga yang dicari tidak ada atau sudah dihapus.', kodeStatus: 404 });
    }
    const errors = validasiKeluarga(req.body);
    if (errors.length) {
      return res.status(400).render('keluarga/form', { title: 'Ubah Keluarga', keluarga: { ...keluarga, ...req.body }, errors });
    }
    store.perbarui('keluarga', req.params.id, {
      namaKepalaKeluarga: req.body.namaKepalaKeluarga.trim(),
      alamat: req.body.alamat.trim(),
      rtRw: (req.body.rtRw || '').trim(),
      noHp: (req.body.noHp || '').trim(),
      aktif: req.body.aktif === 'on',
    });
    res.redirect(`/keluarga/${req.params.id}`);
  } catch (err) {
    next(err);
  }
});

router.post('/:id/hapus', (req, res, next) => {
  try {
    const balitaTerkait = store.cariSemua('balita', (b) => b.keluargaId === req.params.id);
    if (balitaTerkait.length > 0) {
      const keluarga = store.cariById('keluarga', req.params.id);
      return res.status(400).render('keluarga/detail', {
        title: keluarga.namaKepalaKeluarga,
        keluarga,
        daftarBalita: balitaTerkait,
        formatTanggal,
        errorHapus: 'Tidak dapat menghapus keluarga yang masih memiliki data balita. Hapus atau pindahkan data balitanya terlebih dahulu.',
      });
    }
    store.hapus('keluarga', req.params.id);
    res.redirect('/keluarga');
  } catch (err) {
    next(err);
  }
});

module.exports = router;
