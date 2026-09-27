// Fungsi bantu perhitungan usia dari tanggal lahir, dipakai di beberapa fitur
// (data balita, grafik pertumbuhan, jadwal imunisasi).

function hitungUsiaBulan(tanggalLahir, padaTanggal = new Date()) {
  const lahir = new Date(tanggalLahir);
  const acuan = new Date(padaTanggal);
  let bulan = (acuan.getFullYear() - lahir.getFullYear()) * 12 + (acuan.getMonth() - lahir.getMonth());
  if (acuan.getDate() < lahir.getDate()) {
    bulan -= 1;
  }
  return Math.max(0, bulan);
}

function tambahBulan(tanggalStr, jumlahBulan) {
  const d = new Date(tanggalStr);
  d.setMonth(d.getMonth() + jumlahBulan);
  return d;
}

module.exports = { hitungUsiaBulan, tambahBulan };
