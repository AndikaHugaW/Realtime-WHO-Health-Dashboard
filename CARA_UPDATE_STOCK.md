# Cara Update Stock Obat

Ada beberapa cara untuk mengupdate stok obat dalam sistem:

## 1. Melalui Tabel Obat (Stock Table)

**Langkah-langkah:**

1. Scroll ke bawah dashboard sampai ke bagian **"Daftar Obat"**
2. Di kolom **"Aksi"**, ada 2 tombol untuk setiap obat:
   - **Tombol Merah (-)**: Untuk mengurangi stok (penjualan)
   - **Tombol Hijau (+)**: Untuk menambah stok (restock)

3. Cara menggunakannya:
   - Masukkan jumlah di kolom **"Qty"** di sebelah tombol
   - Klik tombol **(-)** untuk menjual/mengurangi stok
   - Klik tombol **(+)** untuk menambah stok

**Contoh:**
- Untuk menjual 2 unit Paracetamol:
  1. Masukkan angka `2` di kolom Qty
  2. Klik tombol merah **(-)**
  3. Stok akan berkurang 2 dan muncul update real-time

- Untuk menambah stok 10 unit:
  1. Masukkan angka `10` di kolom Qty
  2. Klik tombol hijau **(+)**
  3. Stok akan bertambah 10 dan muncul update real-time

## 2. Menambahkan Obat Baru dengan Stok Awal

**Langkah-langkah:**

1. Klik tombol **"+ Tambah Obat Baru"** di bagian atas dashboard
2. Isi form dengan data obat, termasuk **"Stok Awal"**
3. Jika stok awal > 0, sistem akan otomatis:
   - Membuat transaction record
   - Mengirim update real-time
   - Menampilkan di grafik dan statistik

## 3. Melalui API (Untuk Developer)

**Endpoint:** `PATCH /api/medicines/[medicineId]`

**Request Body:**
```json
{
  "event": "sold",  // atau "added"
  "quantity": 5
}
```

**Contoh menggunakan curl:**
```bash
# Mengurangi stok (penjualan)
curl -X PATCH http://localhost:3000/api/medicines/OBT-001 \
  -H "Content-Type: application/json" \
  -d '{"event": "sold", "quantity": 2}'

# Menambah stok
curl -X PATCH http://localhost:3000/api/medicines/OBT-001 \
  -H "Content-Type: application/json" \
  -d '{"event": "added", "quantity": 10}'
```

## Fitur Real-time

Setiap kali stock diupdate, sistem akan:

1. ✅ **Mengirim update real-time** ke semua client yang terhubung
2. ✅ **Menampilkan di section "Update Stok Real-time"**
3. ✅ **Mengupdate grafik stok** secara otomatis
4. ✅ **Mengupdate statistik** (total obat, stok rendah, dll)
5. ✅ **Membuat transaction record** untuk audit trail
6. ✅ **Cek auto reorder** jika stok <= minimum
7. ✅ **Cek expiring medicines**

## Tips

- Pastikan koneksi real-time aktif (lihat indikator hijau di kanan atas)
- Update akan muncul dalam beberapa detik setelah aksi
- Grafik akan otomatis update setelah ada perubahan stok
- Jika stok mencapai minimum, sistem akan otomatis membuat reorder request

