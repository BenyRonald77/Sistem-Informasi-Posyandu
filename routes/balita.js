const express = require('express');
const store = require('../lib/store');
const { formatTanggal, formatUsiaDariBulan } = require('../lib/format');
const { hitungUsiaBulan } = require('../lib/usia');

const router = express.Router();

function validasiBalita(body) {
  const errors = [];
  if (!body.nama || !body.nama.trim()) errors.push('Nama balita wajib diisi.');
  if (!body.tanggalLahir) errors.push('Tanggal lahir wajib diisi.');
  if (body.tanggalLahir && new Date(body.tanggalLahir) > new Date()) {
    errors.push('Tanggal lahir tidak boleh di masa depan.');
  }
  if (!['L', 'P'].includes(body.jenisKelamin)) errors.push('Jenis kelamin wajib dipilih.');
  if (!body.keluargaId) errors.push('Keluarga wajib dipilih.');
  return errors;
}

function validasiPengukuran(body) {
  const errors = [];
  const berat = parseFloat(body.beratKg);
  const tinggi = parseFloat(body.tinggiCm);
  const lingkarKepala = body.lingkarKepalaCm ? parseFloat(body.lingkarKepalaCm) : null;

  if (!body.tanggalUkur) errors.push('Tanggal ukur wajib diisi.');
  if (body.tanggalUkur && new Date(body.tanggalUkur) > new Date()) {
    errors.push('Tanggal ukur tidak boleh di masa depan.');
  }
  if (Number.isNaN(berat) || berat <= 0 || berat > 40) errors.push('Berat badan harus berupa angka antara 0 dan 40 kg.');
  if (Number.isNaN(tinggi) || tinggi <= 0 || tinggi > 150) errors.push('Tinggi/panjang badan harus berupa angka antara 0 dan 150 cm.');
  if (body.lingkarKepalaCm && (Number.isNaN(lingkarKepala) || lingkarKepala <= 0 || lingkarKepala > 60)) {
    errors.push('Lingkar kepala harus berupa angka antara 0 dan 60 cm.');
  }
  return { errors, berat, tinggi, lingkarKepala };
}

router.get('/', (req, res, next) => {
  try {
    const semuaBalita = store.bacaSemua('balita');
    const semuaKeluarga = store.bacaSemua('keluarga');
    const daftar = semuaBalita
      .map((b) => {
        const keluarga = semuaKeluarga.find((k) => k.id === b.keluargaId);
        return {
          ...b,
          namaKeluarga: keluarga ? keluarga.namaKepalaKeluarga : '(keluarga tidak ditemukan)',
          usiaBulan: hitungUsiaBulan(b.tanggalLahir),
        };
      })
      .sort((a, b) => a.nama.localeCompare(b.nama));
    res.render('balita/daftar', { title: 'Data Balita', daftar, formatUsiaDariBulan });
  } catch (err) {
    next(err);
  }
});

router.get('/baru', (req, res, next) => {
  try {
    const semuaKeluarga = store.cariSemua('keluarga', (k) => k.aktif !== false);
    if (semuaKeluarga.length === 0) {
      return res.render('balita/tanpa-keluarga', { title: 'Tambah Balita' });
    }
    res.render('balita/form', {
      title: 'Tambah Balita',
      balita: null,
      errors: [],
      semuaKeluarga,
      keluargaIdTerpilih: req.query.keluargaId || '',
    });
  } catch (err) {
    next(err);
  }
});

router.post('/', (req, res, next) => {
  try {
    const semuaKeluarga = store.bacaSemua('keluarga');
    const errors = validasiBalita(req.body);
    if (errors.length) {
      return res.status(400).render('balita/form', {
        title: 'Tambah Balita', balita: req.body, errors, semuaKeluarga, keluargaIdTerpilih: req.body.keluargaId,
      });
    }
    const baru = store.tambah('balita', {
      keluargaId: req.body.keluargaId,
      nama: req.body.nama.trim(),
      tanggalLahir: req.body.tanggalLahir,
      jenisKelamin: req.body.jenisKelamin,
      createdAt: new Date().toISOString(),
    });
    res.redirect(`/balita/${baru.id}`);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', (req, res, next) => {
  try {
    const balita = store.cariById('balita', req.params.id);
    if (!balita) {
      return res.status(404).render('error', { title: 'Balita Tidak Ditemukan', pesan: 'Data balita yang dicari tidak ada atau sudah dihapus.', kodeStatus: 404 });
    }
    const keluarga = store.cariById('keluarga', balita.keluargaId);
    const riwayatPengukuran = store
      .cariSemua('pengukuran', (p) => p.balitaId === balita.id)
      .sort((a, b) => new Date(a.tanggalUkur) - new Date(b.tanggalUkur));

    res.render('balita/detail', {
      title: balita.nama,
      balita,
      keluarga,
      riwayatPengukuran,
      usiaBulan: hitungUsiaBulan(balita.tanggalLahir),
      formatTanggal,
      formatUsiaDariBulan,
    });
  } catch (err) {
    next(err);
  }
});

router.get('/:id/edit', (req, res, next) => {
  try {
    const balita = store.cariById('balita', req.params.id);
    if (!balita) {
      return res.status(404).render('error', { title: 'Balita Tidak Ditemukan', pesan: 'Data balita yang dicari tidak ada atau sudah dihapus.', kodeStatus: 404 });
    }
    const semuaKeluarga = store.bacaSemua('keluarga');
    res.render('balita/form', {
      title: 'Ubah Data Balita', balita, errors: [], semuaKeluarga, keluargaIdTerpilih: balita.keluargaId,
    });
  } catch (err) {
    next(err);
  }
});

router.post('/:id', (req, res, next) => {
  try {
    const balita = store.cariById('balita', req.params.id);
    if (!balita) {
      return res.status(404).render('error', { title: 'Balita Tidak Ditemukan', pesan: 'Data balita yang dicari tidak ada atau sudah dihapus.', kodeStatus: 404 });
    }
    const errors = validasiBalita(req.body);
    if (errors.length) {
      const semuaKeluarga = store.bacaSemua('keluarga');
      return res.status(400).render('balita/form', {
        title: 'Ubah Data Balita', balita: { ...balita, ...req.body }, errors, semuaKeluarga, keluargaIdTerpilih: req.body.keluargaId,
      });
    }
    store.perbarui('balita', req.params.id, {
      keluargaId: req.body.keluargaId,
      nama: req.body.nama.trim(),
      tanggalLahir: req.body.tanggalLahir,
      jenisKelamin: req.body.jenisKelamin,
    });
    res.redirect(`/balita/${req.params.id}`);
  } catch (err) {
    next(err);
  }
});

router.post('/:id/hapus', (req, res, next) => {
  try {
    const balita = store.cariById('balita', req.params.id);
    store.cariSemua('pengukuran', (p) => p.balitaId === req.params.id).forEach((p) => store.hapus('pengukuran', p.id));
    store.cariSemua('imunisasiStatus', (s) => s.balitaId === req.params.id).forEach((s) => store.hapus('imunisasiStatus', s.id));
    store.hapus('balita', req.params.id);
    res.redirect(balita ? `/keluarga/${balita.keluargaId}` : '/balita');
  } catch (err) {
    next(err);
  }
});

// ===== Pengukuran (sub-resource balita) =====

router.get('/:id/pengukuran/baru', (req, res, next) => {
  try {
    const balita = store.cariById('balita', req.params.id);
    if (!balita) {
      return res.status(404).render('error', { title: 'Balita Tidak Ditemukan', pesan: 'Data balita yang dicari tidak ada atau sudah dihapus.', kodeStatus: 404 });
    }
    res.render('balita/form-pengukuran', { title: `Catat Pengukuran - ${balita.nama}`, balita, errors: [], nilai: {} });
  } catch (err) {
    next(err);
  }
});

router.post('/:id/pengukuran', (req, res, next) => {
  try {
    const balita = store.cariById('balita', req.params.id);
    if (!balita) {
      return res.status(404).render('error', { title: 'Balita Tidak Ditemukan', pesan: 'Data balita yang dicari tidak ada atau sudah dihapus.', kodeStatus: 404 });
    }
    const { errors, berat, tinggi, lingkarKepala } = validasiPengukuran(req.body);
    if (errors.length) {
      return res.status(400).render('balita/form-pengukuran', {
        title: `Catat Pengukuran - ${balita.nama}`, balita, errors, nilai: req.body,
      });
    }
    store.tambah('pengukuran', {
      balitaId: balita.id,
      tanggalUkur: req.body.tanggalUkur,
      beratKg: berat,
      tinggiCm: tinggi,
      lingkarKepalaCm: lingkarKepala,
      catatan: (req.body.catatan || '').trim(),
      createdAt: new Date().toISOString(),
    });
    res.redirect(`/balita/${balita.id}`);
  } catch (err) {
    next(err);
  }
});

router.post('/:id/pengukuran/:pengukuranId/hapus', (req, res, next) => {
  try {
    store.hapus('pengukuran', req.params.pengukuranId);
    res.redirect(`/balita/${req.params.id}`);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
