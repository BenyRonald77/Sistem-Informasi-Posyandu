// Fungsi bantu pemformatan tampilan (bahasa Indonesia).

const NAMA_BULAN = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

function formatTanggal(tanggalStr) {
  if (!tanggalStr) return '-';
  const d = new Date(tanggalStr);
  if (Number.isNaN(d.getTime())) return tanggalStr;
  return `${d.getDate()} ${NAMA_BULAN[d.getMonth()]} ${d.getFullYear()}`;
}

function formatTanggalWaktu(isoStr) {
  if (!isoStr) return '-';
  const d = new Date(isoStr);
  if (Number.isNaN(d.getTime())) return isoStr;
  const jam = String(d.getHours()).padStart(2, '0');
  const menit = String(d.getMinutes()).padStart(2, '0');
  return `${formatTanggal(isoStr)} ${jam}:${menit}`;
}

function formatUsiaDariBulan(usiaBulanTotal) {
  const tahun = Math.floor(usiaBulanTotal / 12);
  const bulan = usiaBulanTotal % 12;
  const bagian = [];
  if (tahun > 0) bagian.push(`${tahun} tahun`);
  bagian.push(`${bulan} bulan`);
  return bagian.join(' ');
}

module.exports = { formatTanggal, formatTanggalWaktu, formatUsiaDariBulan, NAMA_BULAN };
