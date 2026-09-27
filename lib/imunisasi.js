// Master jadwal imunisasi dasar lengkap + lanjutan baduta, mengikuti jadwal
// program imunisasi pemerintah Indonesia (Kementerian Kesehatan). Daftar ini
// adalah ringkasan jadwal imunisasi dasar yang umum dipakai posyandu, bukan
// salinan resmi Peraturan Menteri Kesehatan terbaru - satuan kesehatan yang
// butuh kepastian regulasi terbaru tetap perlu merujuk ke Kemenkes/Dinkes
// setempat.

const { hitungUsiaBulan, tambahBulan } = require('./usia');

const MASTER_IMUNISASI = [
  { kode: 'HB0', nama: 'Hepatitis B (HB0)', usiaBulan: 0, keterangan: 'Diberikan sebelum usia 7 hari' },
  { kode: 'BCG', nama: 'BCG', usiaBulan: 1, keterangan: 'Pencegahan TBC' },
  { kode: 'POLIO1', nama: 'Polio Tetes 1 (OPV1)', usiaBulan: 1, keterangan: '' },
  { kode: 'DPT_HB_HIB1', nama: 'DPT-HB-Hib 1', usiaBulan: 2, keterangan: '' },
  { kode: 'POLIO2', nama: 'Polio Tetes 2 (OPV2)', usiaBulan: 2, keterangan: '' },
  { kode: 'DPT_HB_HIB2', nama: 'DPT-HB-Hib 2', usiaBulan: 3, keterangan: '' },
  { kode: 'POLIO3', nama: 'Polio Tetes 3 (OPV3)', usiaBulan: 3, keterangan: '' },
  { kode: 'DPT_HB_HIB3', nama: 'DPT-HB-Hib 3', usiaBulan: 4, keterangan: '' },
  { kode: 'POLIO4', nama: 'Polio Tetes 4 (OPV4)', usiaBulan: 4, keterangan: '' },
  { kode: 'IPV', nama: 'Polio Suntik (IPV)', usiaBulan: 4, keterangan: '' },
  { kode: 'CAMPAK_MR', nama: 'Campak/MR', usiaBulan: 9, keterangan: '' },
  { kode: 'DPT_HB_HIB_LANJUTAN', nama: 'DPT-HB-Hib Lanjutan', usiaBulan: 18, keterangan: 'Booster baduta' },
  { kode: 'CAMPAK_MR_LANJUTAN', nama: 'Campak/MR Lanjutan', usiaBulan: 18, keterangan: 'Booster baduta' },
];

// Menghasilkan status setiap imunisasi untuk seorang balita, berdasarkan
// usia sekarang dan catatan status tersimpan (dari koleksi imunisasiStatus).
// statusTersimpan: array {kodeImunisasi, status, tanggalPemberian}
function generateDaftarImunisasi(balita, statusTersimpan, tanggalAcuan = new Date()) {
  const usiaSekarangBulan = hitungUsiaBulan(balita.tanggalLahir, tanggalAcuan);

  return MASTER_IMUNISASI.map((master) => {
    const tersimpan = statusTersimpan.find((s) => s.kodeImunisasi === master.kode);
    const sudah = tersimpan && tersimpan.status === 'sudah';
    const tanggalJatuhTempo = tambahBulan(balita.tanggalLahir, master.usiaBulan);
    const selisihHari = Math.round((tanggalJatuhTempo.getTime() - tanggalAcuan.getTime()) / 86400000);

    let statusTampil = 'belum-waktunya';
    if (sudah) {
      statusTampil = 'sudah';
    } else if (selisihHari < 0) {
      statusTampil = 'terlambat';
    } else if (selisihHari <= 14) {
      statusTampil = 'jatuh-tempo-dekat';
    } else if (usiaSekarangBulan >= master.usiaBulan) {
      statusTampil = 'jatuh-tempo-dekat';
    }

    return {
      kode: master.kode,
      nama: master.nama,
      usiaRekomendasiBulan: master.usiaBulan,
      keterangan: master.keterangan,
      status: sudah ? 'sudah' : 'belum',
      statusTampil,
      tanggalPemberian: tersimpan ? tersimpan.tanggalPemberian : null,
      tanggalJatuhTempo: tanggalJatuhTempo.toISOString().slice(0, 10),
      selisihHari,
      statusRowId: tersimpan ? tersimpan.id : null,
    };
  });
}

module.exports = {
  MASTER_IMUNISASI,
  hitungUsiaBulan,
  tambahBulan,
  generateDaftarImunisasi,
};
