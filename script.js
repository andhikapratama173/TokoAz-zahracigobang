// Data awal barang warung (beserta stok)
let daftarBarang = [
  { id: 1, nama: "Minyak Goreng 1 Liter", harga: 18000, stok: 10 },
  { id: 2, nama: "Beras Premium 5 kg", harga: 72000, stok: 5 },
  { id: 3, nama: "Gula Pasir 1 kg", harga: 17500, stok: 15 },
  { id: 4, nama: "Telur Ayam 1 kg", harga: 28000, stok: 8 },
  { id: 5, nama: "Mie Instan Goreng", harga: 3100, stok: 40 },
  { id: 6, nama: "Kopi Kapal Api", harga: 16000, stok: 12 }
];

let keranjang = [];
let totalBelanjaGlobal = 0;

// Ambil riwayat dari LocalStorage jika ada
let riwayatTransaksi = JSON.parse(localStorage.getItem("riwayatTokoAzZahra")) || [];

const kontainer = document.getElementById("katalogBarang");
const kolomCari = document.getElementById("inputCari");
const formBarang = document.getElementById("formBarang");

// Tampilkan katalog barang
function tampilkanBarang(data) {
  kontainer.innerHTML = "";
  if (data.length === 0) {
    kontainer.innerHTML = "<p class='kosong'>Barang tidak ditemukan.</p>";
    return;
  }

  data.forEach(barang => {
    const kartu = document.createElement("div");
    kartu.className = "kartu-barang";
    kartu.innerHTML = `
      <h3>${barang.nama}</h3>
      <p class="harga">Rp ${barang.harga.toLocaleString('id-ID')}</p>
      <p class="stok">Stok: <strong>${barang.stok}</strong></p>
      <button ${barang.stok === 0 ? 'disabled' : ''} onclick="tambahKeKeranjang(${barang.id})">
        ${barang.stok === 0 ? 'Stok Habis' : '+ Tambah'}
      </button>
    `;
    kontainer.appendChild(kartu);
  });
}

// Tambah barang baru via Form
formBarang.addEventListener("submit", function (e) {
  e.preventDefault();
  const nama = document.getElementById("namaBarang").value;
  const harga = parseInt(document.getElementById("hargaBarang").value);
  const stok = parseInt(document.getElementById("stokBarang").value);

  const barangBaru = {
    id: Date.now(),
    nama: nama,
    harga: harga,
    stok: stok
  };

  daftarBarang.push(barangBaru);
  tampilkanBarang(daftarBarang);
  formBarang.reset();
});

// Fitur Kasir & Keranjang
function tambahKeKeranjang(id) {
  const barang = daftarBarang.find(b => b.id === id);

  if (barang && barang.stok > 0) {
    barang.stok -= 1; // Kurangi stok
    
    const itemDiKeranjang = keranjang.find(k => k.id === id);
    if (itemDiKeranjang) {
      itemDiKeranjang.jumlah += 1;
    } else {
      keranjang.push({ id: barang.id, nama: barang.nama, harga: barang.harga, jumlah: 1 });
    }

    tampilkanBarang(daftarBarang);
    updateKeranjang();
  }
}

function updateKeranjang() {
  const containerKeranjang = document.getElementById("daftarKeranjang");
  const totalHargaEl = document.getElementById("totalHarga");

  if (keranjang.length === 0) {
    containerKeranjang.innerHTML = '<p class="kosong">Belum ada barang dipilih.</p>';
    totalHargaEl.innerText = "Rp 0";
    totalBelanjaGlobal = 0;
    hitungKembalian();
    return;
  }

  containerKeranjang.innerHTML = "";
  let total = 0;

  keranjang.forEach(item => {
    const subtotal = item.harga * item.jumlah;
    total += subtotal;

    const div = document.createElement("div");
    div.className = "item-keranjang";
    div.innerHTML = `
      <div>
        <strong>${item.nama}</strong><br>
        <small>${item.jumlah} x Rp ${item.harga.toLocaleString('id-ID')}</small>
      </div>
      <span>Rp ${subtotal.toLocaleString('id-ID')}</span>
    `;
    containerKeranjang.appendChild(div);
  });

  totalBelanjaGlobal = total;
  totalHargaEl.innerText = `Rp ${total.toLocaleString('id-ID')}`;
  hitungKembalian();
}

// Fungsi Menghitung Kembalian
function hitungKembalian() {
  const inputBayar = parseInt(document.getElementById("inputBayar").value) || 0;
  const totalKembalianEl = document.getElementById("totalKembalian");

  if (inputBayar >= totalBelanjaGlobal && totalBelanjaGlobal > 0) {
    const kembalian = inputBayar - totalBelanjaGlobal;
    totalKembalianEl.innerText = `Rp ${kembalian.toLocaleString('id-ID')}`;
  } else {
    totalKembalianEl.innerText = "Rp 0";
  }
}

function selesaiTransaksi() {
  const inputBayar = parseInt(document.getElementById("inputBayar").value) || 0;

  if (keranjang.length === 0) {
    alert("Keranjang masih kosong!");
    return;
  }

  if (inputBayar < totalBelanjaGlobal) {
    alert("Uang pembeli masih kurang!");
    return;
  }

  const kembalian = inputBayar - totalBelanjaGlobal;
  
  // Format rincian barang untuk riwayat
  const rincianBarang = keranjang.map(i => `${i.nama} (${i.jumlah}x)`).join(", ");
  const waktu = new Date().toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' });

  // Simpan transaksi ke riwayat
  const transaksiBaru = {
    waktu: waktu,
    detail: rincianBarang,
    total: totalBelanjaGlobal,
    bayar: inputBayar,
    kembalian: kembalian
  };

  riwayatTransaksi.unshift(transaksiBaru); // Tambah di paling atas
  localStorage.setItem("riwayatTokoAzZahra", JSON.stringify(riwayatTransaksi));

  alert(`Transaksi Berhasil!\n\nTotal Belanja: Rp ${totalBelanjaGlobal.toLocaleString('id-ID')}\nUang Pembeli: Rp ${inputBayar.toLocaleString('id-ID')}\nKembalian: Rp ${kembalian.toLocaleString('id-ID')}`);
  
  keranjang = [];
  document.getElementById("inputBayar").value = "";
  updateKeranjang();
  tampilkanRiwayat();
}

// Tampilkan Tabel Riwayat Penjualan
function tampilkanRiwayat() {
  const tabelBody = document.getElementById("tabelRiwayat");
  tabelBody.innerHTML = "";

  if (riwayatTransaksi.length === 0) {
    tabelBody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: #888;">Belum ada riwayat transaksi.</td></tr>`;
    return;
  }

  riwayatTransaksi.forEach(item => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${item.waktu}</td>
      <td>${item.detail}</td>
      <td>Rp ${item.total.toLocaleString('id-ID')}</td>
      <td>Rp ${item.bayar.toLocaleString('id-ID')}</td>
      <td style="color: #f1c40f;">Rp ${item.kembalian.toLocaleString('id-ID')}</td>
    `;
    tabelBody.appendChild(tr);
  });
}

// Hapus Seluruh Riwayat
function hapusRiwayat() {
  if (confirm("Yakin ingin menghapus seluruh riwayat transaksi?")) {
    riwayatTransaksi = [];
    localStorage.removeItem("riwayatTokoAzZahra");
    tampilkanRiwayat();
  }
}

// Pencarian
kolomCari.addEventListener("input", function (e) {
  const kataKunci = e.target.value.toLowerCase();
  const hasil = daftarBarang.filter(b => b.nama.toLowerCase().includes(kataKunci));
  tampilkanBarang(hasil);
});

// Jalankan saat awal
tampilkanBarang(daftarBarang);
tampilkanRiwayat();