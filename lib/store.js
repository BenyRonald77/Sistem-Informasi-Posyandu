// Penyimpanan data sederhana berbasis berkas JSON, sinkron.
// Setiap koleksi disimpan sebagai satu berkas data/<koleksi>.json berisi array objek.
// Ditulis sinkron karena skala data posyandu kecil (satu posyandu, ratusan balita),
// sehingga tidak butuh basis data server terpisah.

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATA_DIR = path.join(__dirname, '..', 'data');

function pastikanFolderData() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function pathKoleksi(nama) {
  return path.join(DATA_DIR, `${nama}.json`);
}

function bacaSemua(nama) {
  pastikanFolderData();
  const file = pathKoleksi(nama);
  if (!fs.existsSync(file)) {
    return [];
  }
  const isi = fs.readFileSync(file, 'utf8').trim();
  if (!isi) return [];
  try {
    return JSON.parse(isi);
  } catch (err) {
    throw new Error(`Berkas data ${nama}.json rusak/tidak valid JSON: ${err.message}`);
  }
}

function tulisSemua(nama, data) {
  pastikanFolderData();
  const file = pathKoleksi(nama);
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
}

function cariSemua(nama, filterFn) {
  const semua = bacaSemua(nama);
  return filterFn ? semua.filter(filterFn) : semua;
}

function cariSatu(nama, filterFn) {
  const semua = bacaSemua(nama);
  return semua.find(filterFn) || null;
}

function cariById(nama, id) {
  return cariSatu(nama, (item) => item.id === id);
}

function tambah(nama, objek) {
  const semua = bacaSemua(nama);
  const baru = {
    id: crypto.randomUUID(),
    ...objek,
  };
  semua.push(baru);
  tulisSemua(nama, semua);
  return baru;
}

function perbarui(nama, id, perubahan) {
  const semua = bacaSemua(nama);
  const idx = semua.findIndex((item) => item.id === id);
  if (idx === -1) return null;
  semua[idx] = { ...semua[idx], ...perubahan };
  tulisSemua(nama, semua);
  return semua[idx];
}

function hapus(nama, id) {
  const semua = bacaSemua(nama);
  const idx = semua.findIndex((item) => item.id === id);
  if (idx === -1) return false;
  semua.splice(idx, 1);
  tulisSemua(nama, semua);
  return true;
}

// Untuk koleksi "single document" seperti pengaturan.
function ambilTunggal(nama, idTetap) {
  return cariById(nama, idTetap);
}

function simpanTunggal(nama, idTetap, data) {
  const ada = cariById(nama, idTetap);
  if (ada) {
    return perbarui(nama, idTetap, data);
  }
  const semua = bacaSemua(nama);
  const baru = { id: idTetap, ...data };
  semua.push(baru);
  tulisSemua(nama, semua);
  return baru;
}

module.exports = {
  bacaSemua,
  tulisSemua,
  cariSemua,
  cariSatu,
  cariById,
  tambah,
  perbarui,
  hapus,
  ambilTunggal,
  simpanTunggal,
};
