# Panduan Setup Project

## Persyaratan

- Node.js 18+ 
- npm atau yarn

## Langkah-langkah Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Environment Variables

Buat file `.env` di root project:

```env
DATABASE_URL="file:./dev.db"
```

Untuk production, gunakan PostgreSQL atau MySQL:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/medicines?schema=public"
```

### 3. Setup Database

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init
```

### 4. Seed Sample Data (Optional)

Untuk menambahkan data sample obat:

**Opsi 1: Menggunakan API Endpoint**
```bash
# Jalankan server terlebih dahulu (npm run dev), lalu:
curl -X POST http://localhost:3000/api/medicines/seed
```

**Opsi 2: Menggunakan Script**
```bash
# Install tsx jika belum ada
npm install -D tsx

# Run seed script
npx tsx scripts/seed.ts
```

### 5. Jalankan Development Server

```bash
npm run dev
```

Akses aplikasi di [http://localhost:3000](http://localhost:3000)

## Fitur yang Tersedia

### Dashboard
- **Statistik Real-time**: Total obat, stok rendah, nilai inventori, reorder pending
- **Grafik Stok**: Visualisasi obat dengan stok rendah
- **Update Real-time**: Live update setiap perubahan stok
- **Deteksi Expired**: Obat yang akan kadaluarsa dalam 30 hari
- **Auto Reorder**: Sistem otomatis membuat permintaan reorder

### Manajemen Stok
- Tambah/Update stok obat
- Penjualan (mengurangi stok)
- Penambahan stok dari distributor

### API Endpoints

- `GET /api/medicines` - Daftar semua obat
- `POST /api/medicines` - Tambah obat baru
- `PATCH /api/medicines/[id]` - Update stok (sold/added)
- `GET /api/reorder` - Daftar reorder requests
- `POST /api/reorder` - Update status reorder
- `GET /api/expiring` - Obat yang akan expired
- `GET /api/events` - SSE stream untuk real-time updates

## Troubleshooting

### Database Error
Jika terjadi error database, pastikan:
1. File `.env` sudah dibuat dengan `DATABASE_URL` yang benar
2. Sudah menjalankan `npx prisma generate`
3. Sudah menjalankan `npx prisma migrate dev`

### Port Already in Use
Jika port 3000 sudah digunakan:
```bash
# Gunakan port lain
PORT=3001 npm run dev
```

### TypeScript Errors
Jika ada error TypeScript, pastikan:
1. Sudah menjalankan `npm install`
2. File `tsconfig.json` sudah benar
3. Restart TypeScript server di editor Anda

