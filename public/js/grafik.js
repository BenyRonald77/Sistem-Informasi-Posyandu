(function () {
  'use strict';

  // Warna mengikuti skill dataviz: pita/median rujukan WHO memakai biru
  // (kategori 1), titik pengukuran anak memakai oranye (kategori 2). Pasangan
  // biru/oranye ini divalidasi aman untuk buta warna merah-hijau. Lihat
  // DESIGN.md bagian "Grafik pertumbuhan".
  var WARNA_REFERENSI = '#2a78d6';
  var WARNA_ANAK = '#eb6834';

  var skrip = document.currentScript;
  var balitaId = skrip.getAttribute('data-balita-id');

  var elLoading = document.getElementById('status-loading');
  var elGalat = document.getElementById('status-galat');
  var elPesanGalat = document.getElementById('pesan-galat');
  var elWadahChart = document.getElementById('wadah-chart');
  var tombolCobaLagi = document.getElementById('tombol-coba-lagi');

  function tampilkanLoading() {
    elLoading.style.display = 'flex';
    elGalat.style.display = 'none';
    elWadahChart.style.display = 'none';
  }

  function tampilkanGalat(pesan) {
    elLoading.style.display = 'none';
    elGalat.style.display = 'block';
    elWadahChart.style.display = 'none';
    elPesanGalat.textContent = pesan;
  }

  function tampilkanChart() {
    elLoading.style.display = 'none';
    elGalat.style.display = 'none';
    elWadahChart.style.display = 'block';
  }

  function buatDatasetReferensi(referensi) {
    return [
      {
        label: 'Median WHO',
        data: referensi.usiaBulan.map(function (usia, i) {
          return { x: usia, y: referensi.median[i] };
        }),
        borderColor: WARNA_REFERENSI,
        backgroundColor: WARNA_REFERENSI,
        borderWidth: 2,
        pointRadius: 0,
        borderDash: [],
        fill: false,
        tension: 0.25,
        order: 3,
      },
      {
        label: '+2 SD WHO',
        data: referensi.usiaBulan.map(function (usia, i) {
          return { x: usia, y: referensi.sdPlus2[i] };
        }),
        borderColor: WARNA_REFERENSI,
        backgroundColor: 'rgba(42, 120, 214, 0.12)',
        borderWidth: 1,
        borderDash: [4, 4],
        pointRadius: 0,
        fill: '+1',
        tension: 0.25,
        order: 4,
      },
      {
        label: '-2 SD WHO',
        data: referensi.usiaBulan.map(function (usia, i) {
          return { x: usia, y: referensi.sdMinus2[i] };
        }),
        borderColor: WARNA_REFERENSI,
        backgroundColor: 'rgba(42, 120, 214, 0.12)',
        borderWidth: 1,
        borderDash: [4, 4],
        pointRadius: 0,
        fill: false,
        tension: 0.25,
        order: 5,
      },
    ];
  }

  function buatDatasetAnak(titikPengukuran, kunciNilai, namaBalita) {
    return {
      label: namaBalita + ' (hasil ukur)',
      data: titikPengukuran.map(function (p) {
        return { x: p.usiaBulan, y: p[kunciNilai] };
      }),
      borderColor: WARNA_ANAK,
      backgroundColor: WARNA_ANAK,
      borderWidth: 2,
      pointRadius: 5,
      pointHoverRadius: 7,
      showLine: true,
      tension: 0,
      order: 1,
    };
  }

  function opsiChart(labelSumbuY) {
    return {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'nearest', intersect: false },
      scales: {
        x: {
          type: 'linear',
          title: { display: true, text: 'Usia (bulan)' },
          min: 0,
          max: 60,
          ticks: { stepSize: 6 },
        },
        y: {
          title: { display: true, text: labelSumbuY },
        },
      },
      plugins: {
        legend: { display: true, position: 'bottom' },
        tooltip: {
          callbacks: {
            title: function (items) {
              if (!items.length) return '';
              return 'Usia ' + items[0].parsed.x + ' bulan';
            },
          },
        },
      },
    };
  }

  function muatData() {
    tampilkanLoading();
    fetch('/balita/' + balitaId + '/grafik-data')
      .then(function (res) {
        if (!res.ok) {
          throw new Error('Server merespons dengan status ' + res.status + '.');
        }
        return res.json();
      })
      .then(function (data) {
        renderChart(data);
        tampilkanChart();
      })
      .catch(function (err) {
        tampilkanGalat('Tidak dapat memuat data grafik (' + err.message + '). Periksa koneksi lalu coba lagi.');
      });
  }

  function renderChart(data) {
    var ctxBerat = document.getElementById('chartBerat').getContext('2d');
    var ctxTinggi = document.getElementById('chartTinggi').getContext('2d');

    var datasetBerat = buatDatasetReferensi(data.referensiBerat).concat([
      buatDatasetAnak(data.titikPengukuran, 'beratKg', data.balita.nama),
    ]);
    var datasetTinggi = buatDatasetReferensi(data.referensiTinggi).concat([
      buatDatasetAnak(data.titikPengukuran, 'tinggiCm', data.balita.nama),
    ]);

    // eslint-disable-next-line no-undef
    new Chart(ctxBerat, { type: 'line', data: { datasets: datasetBerat }, options: opsiChart('Berat (kg)') });
    // eslint-disable-next-line no-undef
    new Chart(ctxTinggi, { type: 'line', data: { datasets: datasetTinggi }, options: opsiChart('Tinggi/panjang (cm)') });
  }

  tombolCobaLagi.addEventListener('click', muatData);
  muatData();
}());
