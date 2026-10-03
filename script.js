/* =====================================================
   UNDANGAN PERNIKAHAN BALI - script.js
   Data yang sering diganti ada di bagian PENGATURAN.
   ===================================================== */

/* ---------- PENGATURAN (ganti di sini) ---------- */
var NOMOR_WA   = "6281234567890";                 // format 62, tanpa 0 di depan
var URL_RSVP    = "https://script.google.com/macros/s/AKfycbyVn9tdJEuz-XuljrCrqsSwbEWpZZIfejvAxihOjcURf8CTBWBAJtHdCvmNSBofpbP0Wg/exec";                              // isi dengan URL Web App Google Apps Script (kosong = RSVP lewat WhatsApp)
var WAKTU_ACARA = "2026-10-16T08:00:00+08:00";    // GANTI sesuai jam acara (WITA = +08:00)
var JUDUL_KALENDER = "Pawiwahan Gede & Komang";
var LOKASI_KALENDER = "Desa Bumi Sejahtera, Kaliorang";
var KALENDER_MULAI = "20261016T000000Z";          // format UTC (08.00 WITA = 00.00 UTC)
var KALENDER_SELESAI = "20261016T080000Z";        // 16.00 WITA = 08.00 UTC


/* ---------- Pintasan ---------- */
function el(id) { return document.getElementById(id); }


/* ---------- 1. Nama tamu dari link (?to=Nama Tamu) ---------- */
var namaTamu = new URLSearchParams(location.search).get("to");
if (namaTamu) {
  el("tamu").textContent = namaTamu;
  el("nama").value = namaTamu;
}


/* ---------- 2. Hitung mundur ---------- */
/* ---------- 2. Hitung mundur ---------- */
var WAKTU_ACARA = "2026-10-16T17:00:00+08:00";
var KALENDER_MULAI = "20261016T090000Z";
var KALENDER_SELESAI = "20261016T100000Z";

var waktuAcara = new Date(WAKTU_ACARA).getTime();

function perbaruiHitungMundur() {
  var sisa = waktuAcara - Date.now();
  if (sisa < 0) sisa = 0;

  el("hari").textContent   = Math.floor(sisa / 864e5);
  el("jam").textContent    = Math.floor(sisa % 864e5 / 36e5);
  el("menit").textContent  = Math.floor(sisa % 36e5 / 6e4);
  el("detik").textContent  = Math.floor(sisa % 6e4 / 1e3);
}
perbaruiHitungMundur();
setInterval(perbaruiHitungMundur, 1000);


/* ---------- 3. Simpan ke kalender ---------- */
el("tombol-kalender").href =
  "https://calendar.google.com/calendar/render?action=TEMPLATE" +
  "&text=" + encodeURIComponent(JUDUL_KALENDER) +
  "&dates=" + KALENDER_MULAI + "/" + KALENDER_SELESAI +
  "&location=" + encodeURIComponent(LOKASI_KALENDER);


/* ---------- 4. RSVP + daftar ucapan ----------
   Kalau URL_RSVP diisi: jawaban masuk ke Google Sheets dan ucapan tampil di bawah form.
   Kalau URL_RSVP kosong: jawaban dikirim lewat WhatsApp. */
function tampilkanUcapan(daftar) {
  var kotak = el("daftar-ucapan");
  kotak.textContent = "";

  if (!daftar.length) {
    var kosong = document.createElement("div");
    kosong.className = "kosong";
    kosong.textContent = "Jadilah yang pertama memberi ucapan.";
    kotak.appendChild(kosong);
    return;
  }

  daftar.forEach(function (u) {
    var item = document.createElement("div");
    item.className = "ucapan";

    var nama = document.createElement("b");
    nama.textContent = u.nama;
    var status = document.createElement("span");
    status.textContent = u.kehadiran;
    var isi = document.createElement("p");
    isi.textContent = u.ucapan;

    item.appendChild(nama);
    item.appendChild(status);
    item.appendChild(isi);
    kotak.appendChild(item);
  });
}

function muatUcapan() {
  fetch(URL_RSVP)
    .then(function (r) { return r.json(); })
    .then(tampilkanUcapan)
    .catch(function () {});
}

if (URL_RSVP && el("wadah-ucapan")) {
  el("wadah-ucapan").hidden = false;
  el("form-rsvp").querySelector("button").textContent = "Kirim Konfirmasi";
  muatUcapan();
}

el("form-rsvp").addEventListener("submit", function (e) {
  e.preventDefault();

  /* a) Tanpa URL_RSVP: kirim lewat WhatsApp */
  if (!URL_RSVP) {
    var pesan =
      "Om Swastyastu, saya " + el("nama").value +
      " (" + el("kehadiran").value + ", " + el("jumlah").value + " orang)." +
      (el("ucapan").value ? "\nUcapan: " + el("ucapan").value : "");
    window.open("https://wa.me/" + NOMOR_WA + "?text=" + encodeURIComponent(pesan), "_blank");
    return;
  }

  /* b) Dengan URL_RSVP: simpan ke Google Sheets, lalu muat ulang daftar ucapan */
  var tombol = e.target.querySelector("button");
  tombol.disabled = true;
  tombol.textContent = "Mengirim...";

  var data = new URLSearchParams({
    nama: el("nama").value,
    kehadiran: el("kehadiran").value,
    jumlah: el("jumlah").value,
    ucapan: el("ucapan").value
  });

  fetch(URL_RSVP, { method: "POST", mode: "no-cors", body: data })
    .then(function () {
      tombol.textContent = "Terkirim, terima kasih";
      e.target.reset();
      setTimeout(muatUcapan, 1500);
      setTimeout(function () { tombol.disabled = false; tombol.textContent = "Kirim Konfirmasi"; }, 4000);
    })
    .catch(function () {
      tombol.disabled = false;
      tombol.textContent = "Kirim ulang";
      alert("Gagal mengirim. Periksa internet lalu coba lagi.");
    });
});


/* ---------- 5. Salin nomor rekening ---------- */
if (el("tombol-salin")) el("tombol-salin").addEventListener("click", function () {
  var tombol = this;
  try {
    navigator.clipboard
      .writeText(el("rekening").textContent)
      .then(function () { tombol.textContent = "Tersalin"; });
  } catch (err) {
    tombol.textContent = "Salin manual";
  }
});


/* ---------- 6. Musik (opsional) ----------
   Aktif otomatis kalau elemen #musik di index.html sudah dibuka komentarnya.
   Browser memblokir suara yang berbunyi sendiri, jadi lagu dicoba diputar saat halaman dibuka
   dan otomatis mulai saat tamu pertama kali menyentuh layar, klik, atau menekan tombol. */
var musik = el("musik");
if (musik) {
  var pemicu = ["click", "touchend", "keydown"];

  var hentikanPemicu = function () {
    pemicu.forEach(function (nama) { document.removeEventListener(nama, mulaiMusik); });
  };

  var mulaiMusik = function () {
    var hasil = musik.play();
    if (hasil && hasil.then) {
      hasil.then(hentikanPemicu).catch(function () {});
    } else {
      hentikanPemicu();
    }
  };

  pemicu.forEach(function (nama) { document.addEventListener(nama, mulaiMusik); });
  mulaiMusik();

  if (el("tombol-musik")) {
    el("tombol-musik").addEventListener("click", function () {
      musik.paused ? musik.play() : musik.pause();
    });
  }
}
