// Logika pembuatan notifikasi pengingat in-app.
//
// PENTING (kejujuran soal notifikasi): fungsi di sini hanya MENYIMPAN catatan
// notifikasi ke koleksi data lokal (data/notifikasi.json) dan menampilkannya
// di halaman "Pengingat untuk Orang Tua". Tidak ada pengiriman pesan nyata ke
// perangkat orang tua (tidak ada integrasi SMS/WhatsApp/email). Kader yang
// menyampaikan pengingat ini secara manual (dicetak, ditunjukkan, atau
// dibacakan) saat kunjungan atau lewat saluran komunikasi kader sendiri.

const store = require('./store');
const { generateDaftarImunisasi } = require('./imunisasi');

const JENDELA_HARI_IMUNISASI = 14;

function tanggalHariIniStr(tanggal = new Date()) {
  return tanggal.toISOString().slice(0, 10);
}

// Menghitung tanggal posyandu bulanan berikutnya dari hari ini, berdasarkan
// tanggal rutin (1-28) yang disetel di Pengaturan.
function tanggalPosyanduBerikutnya(tanggalRutin, dariTanggal = new Date()) {
  const acuan = new Date(dariTanggal);
  acuan.setHours(0, 0, 0, 0);
  let kandidat = new Date(acuan.getFullYear(), acuan.getMonth(), tanggalRutin);
  if (kandidat.getTime() < acuan.getTime()) {
    kandidat = new Date(acuan.getFullYear(), acuan.getMonth() + 1, tanggalRutin);
  }
  return kandidat;
}

function sudahAdaNotifikasiDenganKunci(kunciDedup) {
  return store.cariSatu('notifikasi', (n) => n.kunciDedup === kunciDedup) !== null;
}

function buatNotifikasiPosyanduH3(tanggalAcuan = new Date()) {
  const pengaturan = store.ambilTunggal('pengaturan', 'umum');
  if (!pengaturan || !pengaturan.tanggalRutinPosyandu) {
    return { dibuat: 0, alasan: 'Pengaturan tanggal posyandu bulanan belum diisi.' };
  }

  const tglBerikutnya = tanggalPosyanduBerikutnya(pengaturan.tanggalRutinPosyandu, tanggalAcuan);
  const acuan = new Date(tanggalAcuan);
  acuan.setHours(0, 0, 0, 0);
  const selisihHari = Math.round((tglBerikutnya.getTime() - acuan.getTime()) / 86400000);

  if (selisihHari !== 3) {
    return {
      dibuat: 0,
      alasan: `Bukan H-3 (posyandu berikutnya ${selisihHari} hari lagi, tanggal ${tglBerikutnya.toISOString().slice(0, 10)}).`,
    };
  }

  const kunciBulan = `posyandu-${tglBerikutnya.getFullYear()}-${tglBerikutnya.getMonth() + 1}`;
  const semuaKeluarga = store.cariSemua('keluarga', (k) => k.aktif !== false);
  let dibuat = 0;

  semuaKeluarga.forEach((keluarga) => {
    const kunciDedup = `${kunciBulan}-${keluarga.id}`;
    if (sudahAdaNotifikasiDenganKunci(kunciDedup)) return;
    store.tambah('notifikasi', {
      tipe: 'posyandu',
      keluargaId: keluarga.id,
      balitaId: null,
      judul: `Pengingat Posyandu - ${pengaturan.namaPosyandu || 'Posyandu'}`,
      pesan: `Posyandu ${pengaturan.namaPosyandu || ''} akan dilaksanakan pada ${tglBerikutnya.toISOString().slice(0, 10)} (3 hari lagi). Mohon sampaikan ke keluarga ${keluarga.namaKepalaKeluarga} untuk membawa balita ke posyandu.`,
      tanggalDibuat: new Date().toISOString(),
      sudahDibaca: false,
      kunciDedup,
    });
    dibuat += 1;
  });

  return { dibuat, alasan: `H-3 menuju posyandu tanggal ${tglBerikutnya.toISOString().slice(0, 10)}.` };
}

function buatNotifikasiImunisasiJatuhTempo(tanggalAcuan = new Date()) {
  const semuaBalita = store.bacaSemua('balita');
  const semuaStatus = store.bacaSemua('imunisasiStatus');
  let dibuat = 0;
  const rincian = [];

  semuaBalita.forEach((balita) => {
    const statusBalita = semuaStatus.filter((s) => s.balitaId === balita.id);
    const daftar = generateDaftarImunisasi(balita, statusBalita, tanggalAcuan);

    daftar
      .filter((item) => {
        const dalamJendelaDekat = item.statusTampil === 'jatuh-tempo-dekat' && item.selisihHari >= 0 && item.selisihHari <= JENDELA_HARI_IMUNISASI;
        const sudahTerlambat = item.statusTampil === 'terlambat';
        return dalamJendelaDekat || sudahTerlambat;
      })
      .forEach((item) => {
        const kunciDedup = `imunisasi-${balita.id}-${item.kode}`;
        if (sudahAdaNotifikasiDenganKunci(kunciDedup)) return;
        const keluarga = store.cariById('keluarga', balita.keluargaId);
        store.tambah('notifikasi', {
          tipe: 'imunisasi',
          keluargaId: balita.keluargaId,
          balitaId: balita.id,
          judul: `Imunisasi ${item.nama} untuk ${balita.nama}`,
          pesan: `Imunisasi ${item.nama} untuk balita ${balita.nama}${keluarga ? ` (keluarga ${keluarga.namaKepalaKeluarga})` : ''} ${item.statusTampil === 'terlambat' ? 'sudah lewat dari jadwal' : 'jatuh tempo'} pada ${item.tanggalJatuhTempo}. Mohon diingatkan ke orang tua saat kunjungan posyandu berikutnya.`,
          tanggalDibuat: new Date().toISOString(),
          sudahDibaca: false,
          kunciDedup,
        });
        dibuat += 1;
        rincian.push(`${balita.nama}: ${item.nama}`);
      });
  });

  return { dibuat, rincian };
}

function jalankanSemuaPengingat(tanggalAcuan = new Date()) {
  const hasilPosyandu = buatNotifikasiPosyanduH3(tanggalAcuan);
  const hasilImunisasi = buatNotifikasiImunisasiJatuhTempo(tanggalAcuan);
  return {
    waktuJalan: new Date().toISOString(),
    tanggalAcuan: tanggalHariIniStr(tanggalAcuan),
    posyandu: hasilPosyandu,
    imunisasi: hasilImunisasi,
  };
}

module.exports = {
  tanggalPosyanduBerikutnya,
  buatNotifikasiPosyanduH3,
  buatNotifikasiImunisasiJatuhTempo,
  jalankanSemuaPengingat,
  JENDELA_HARI_IMUNISASI,
};
