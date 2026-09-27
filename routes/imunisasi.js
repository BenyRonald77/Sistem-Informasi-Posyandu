const express = require('express');
const store = require('../lib/store');
const { generateDaftarImunisasi, MASTER_IMUNISASI } = require('../lib/imunisasi');
const { hitungUsiaBulan } = require('../lib/usia');
const { formatTanggal, formatUsiaDariBulan } = require('../lib/format');

const router = express.Router();

router.get('/:id/imunisasi', (req, res, next) => {
  try {
    const balita = store.cariById('balita', req.params.id);
    if (!balita) {
      return res.status(404).render('error', { title: 'Balita Tidak Ditemukan', pesan: 'Data balita yang dicari tidak ada atau sudah dihapus.', kodeStatus: 404 });
    }
    const statusTersimpan = store.cariSemua('imunisasiStatus', (s) => s.balitaId === balita.id);
    const daftar = generateDaftarImunisasi(balita, statusTersimpan);

    res.render('balita/imunisasi', {
      title: `Jadwal Imunisasi - ${balita.nama}`,
      balita,
      daftar,
      usiaBulan: hitungUsiaBulan(balita.tanggalLahir),
      formatTanggal,
      formatUsiaDariBulan,
    });
  } catch (err) {
    next(err);
  }
});

router.post('/:id/imunisasi/:kode', (req, res, next) => {
  try {
    const balita = store.cariById('balita', req.params.id);
    if (!balita) {
      return res.status(404).render('error', { title: 'Balita Tidak Ditemukan', pesan: 'Data balita yang dicari tidak ada atau sudah dihapus.', kodeStatus: 404 });
    }
    const masterCocok = MASTER_IMUNISASI.find((m) => m.kode === req.params.kode);
    if (!masterCocok) {
      return res.status(404).render('error', { title: 'Jenis Imunisasi Tidak Dikenal', pesan: 'Kode imunisasi tidak ditemukan pada master jadwal.', kodeStatus: 404 });
    }

    const statusBaru = req.body.status === 'sudah' ? 'sudah' : 'belum';
    const tanggalPemberian = statusBaru === 'sudah' ? (req.body.tanggalPemberian || new Date().toISOString().slice(0, 10)) : null;

    const existing = store.cariSatu('imunisasiStatus', (s) => s.balitaId === balita.id && s.kodeImunisasi === req.params.kode);
    if (existing) {
      store.perbarui('imunisasiStatus', existing.id, {
        status: statusBaru,
        tanggalPemberian,
        updatedAt: new Date().toISOString(),
      });
    } else {
      store.tambah('imunisasiStatus', {
        balitaId: balita.id,
        kodeImunisasi: req.params.kode,
        status: statusBaru,
        tanggalPemberian,
        updatedAt: new Date().toISOString(),
      });
    }
    res.redirect(`/balita/${balita.id}/imunisasi`);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
