const express = require('express');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');

const routeDashboard = require('./routes/dashboard');
const routeKeluarga = require('./routes/keluarga');
const routeBalita = require('./routes/balita');
const routeGrafik = require('./routes/grafik');
const routeImunisasi = require('./routes/imunisasi');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layout');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  res.locals.urlSaatIni = req.path;
  next();
});

app.use('/', routeDashboard);
app.use('/keluarga', routeKeluarga);
app.use('/balita', routeBalita);
app.use('/balita', routeGrafik);
app.use('/balita', routeImunisasi);

app.use((req, res) => {
  res.status(404).render('error', {
    title: 'Halaman Tidak Ditemukan',
    pesan: `Halaman "${req.path}" tidak ditemukan.`,
    kodeStatus: 404,
  });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).render('error', {
    title: 'Terjadi Kesalahan',
    pesan: err.message || 'Terjadi kesalahan pada server.',
    kodeStatus: 500,
  });
});

app.listen(PORT, () => {
  console.log(`Sistem Informasi Posyandu berjalan di http://localhost:${PORT}`);
});

module.exports = app;
