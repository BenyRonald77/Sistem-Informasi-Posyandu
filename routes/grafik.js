const express = require('express');
const store = require('../lib/store');
const { deretReferensi, CATATAN_SUMBER } = require('../lib/whoReference');
const { hitungUsiaBulan } = require('../lib/imunisasi');

const router = express.Router();

router.get('/:id/grafik', (req, res, next) => {
  try {
    const balita = store.cariById('balita', req.params.id);
    if (!balita) {
      return res.status(404).render('error', { title: 'Balita Tidak Ditemukan', pesan: 'Data balita yang dicari tidak ada atau sudah dihapus.', kodeStatus: 404 });
    }
    const jumlahPengukuran = store.cariSemua('pengukuran', (p) => p.balitaId === balita.id).length;
    res.render('balita/grafik', {
      title: `Grafik Pertumbuhan - ${balita.nama}`,
      balita,
      jumlahPengukuran,
      catatanSumber: CATATAN_SUMBER,
    });
  } catch (err) {
    next(err);
  }
});

// Endpoint data JSON untuk grafik: titik referensi WHO + titik pengukuran anak.
router.get('/:id/grafik-data', (req, res, next) => {
  try {
    const balita = store.cariById('balita', req.params.id);
    if (!balita) {
      return res.status(404).json({ error: 'Balita tidak ditemukan.' });
    }
    const usiaMaks = Math.max(60, hitungUsiaBulan(balita.tanggalLahir) + 2);
    const refBerat = deretReferensi('berat', balita.jenisKelamin, Math.min(usiaMaks, 60));
    const refTinggi = deretReferensi('tinggi', balita.jenisKelamin, Math.min(usiaMaks, 60));

    const pengukuran = store
      .cariSemua('pengukuran', (p) => p.balitaId === balita.id)
      .sort((a, b) => new Date(a.tanggalUkur) - new Date(b.tanggalUkur))
      .map((p) => ({
        tanggalUkur: p.tanggalUkur,
        usiaBulan: hitungUsiaBulan(balita.tanggalLahir, new Date(p.tanggalUkur)),
        beratKg: p.beratKg,
        tinggiCm: p.tinggiCm,
      }));

    res.json({
      balita: { nama: balita.nama, jenisKelamin: balita.jenisKelamin, tanggalLahir: balita.tanggalLahir },
      referensiBerat: refBerat,
      referensiTinggi: refTinggi,
      titikPengukuran: pengukuran,
      catatanSumber: CATATAN_SUMBER,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
