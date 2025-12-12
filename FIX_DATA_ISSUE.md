# Fix: Data Tidak Muncul - Solusi

## Masalah
Data tidak muncul di dashboard karena:
1. Database belum di-migrate dengan schema WHO baru
2. Database masih menggunakan schema lama (medicine inventory)
3. API mengembalikan empty array jika tidak ada data

## Solusi Cepat

### Opsi 1: Reset Database dan Migrate (RECOMMENDED)

```bash
# Stop dev server terlebih dahulu (Ctrl+C)

# Reset database
npx prisma migrate reset --force

# Generate Prisma client
npx prisma generate

# Create new migration
npx prisma migrate dev --name init_who_health

# Seed data
curl -X POST http://localhost:3000/api/who/seed
```

### Opsi 2: Buat Migration Baru (Keep Existing Data)

```bash
# Generate Prisma client
npx prisma generate

# Create migration (will need to resolve conflicts manually)
npx prisma migrate dev --name add_who_health

# Seed data
curl -X POST http://localhost:3000/api/who/seed
```

### Opsi 3: Manual Seed via Browser

1. Pastikan server berjalan: `npm run dev`
2. Buka browser ke: `http://localhost:3000/api/who/seed`
3. Atau gunakan endpoint POST: `http://localhost:3000/api/who/seed`

## Testing

Setelah seed data, cek apakah data muncul:
1. Refresh browser di `http://localhost:3000`
2. Data harus muncul di dashboard
3. Jika masih kosong, check console untuk error

## API Endpoints untuk Testing

- `GET /api/who/health` - Harus return array data
- `GET /api/who/outbreaks` - Harus return array outbreaks
- `POST /api/who/seed` - Seed data ke database

## Troubleshooting

Jika masih tidak muncul:
1. Check browser console (F12) untuk error
2. Check server terminal untuk error Prisma
3. Pastikan database file `dev.db` ada di root
4. Coba restart dev server

