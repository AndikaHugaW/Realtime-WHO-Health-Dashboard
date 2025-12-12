# Cara Fix: Data Tidak Muncul

## Masalah
Data tidak muncul karena database belum di-migrate dengan schema baru untuk WHO health data.

## Solusi Cepat (Recommended)

### Langkah 1: Stop Dev Server
Tekan `Ctrl+C` di terminal untuk stop server (jika masih running).

### Langkah 2: Reset & Migrate Database

```bash
# Reset database (akan drop semua tabel lama)
npx prisma migrate reset --force

# Generate Prisma client
npx prisma generate

# Create migration baru
npx prisma migrate dev --name init_who_health
```

Saat diminta konfirmasi, ketik `y` atau tekan Enter.

### Langkah 3: Start Server Lagi

```bash
npm run dev
```

### Langkah 4: Refresh Browser

Buka `http://localhost:3000` dan refresh (F5). Data harus muncul sekarang!

## Alternatif: Jika Tidak Mau Reset Database

Jika ingin keep data lama dan hanya tambah tabel baru:

1. Buat migration file manual di `prisma/migrations/YYYYMMDDHHMMSS_add_who_tables/migration.sql`
2. Atau gunakan Prisma Studio untuk manual create tables

## Testing

Setelah migration, cek:
- Browser console (F12) - tidak ada error
- Dashboard menampilkan data
- API endpoint: `http://localhost:3000/api/who/health` return data

## Catatan

**API sudah diperbaiki** untuk selalu return mock data meskipun database belum di-migrate. Tapi untuk best experience, sebaiknya migrate database dulu.

Data akan otomatis muncul setelah migration karena API akan:
1. Fetch data dari WHO API (atau mock)
2. Store ke database
3. Return data untuk ditampilkan

