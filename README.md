# WHO Health Data Streaming Dashboard

Dashboard real-time untuk monitoring data kesehatan global dari World Health Organization (WHO) menggunakan Next.js 14 dan Tailwind CSS.

## 🎯 Ide Proyek

**WHO Real-time Health Monitoring Dashboard** adalah aplikasi web yang menampilkan data kesehatan global secara real-time dari WHO API, dengan fitur streaming data, monitoring outbreak, dan visualisasi data kesehatan per negara.

Lihat detail ide proyek di [PROJECT_IDEA.md](./PROJECT_IDEA.md)

## ✨ Fitur

- ✅ **Dashboard Statistik Global** - Monitoring statistik kesehatan global secara real-time
- ✅ **Streaming Data Real-time** - Update data kesehatan menggunakan Server-Sent Events (SSE)
- ✅ **Grafik Area Chart** - Visualisasi data kesehatan menggunakan area chart dengan gradient
- ✅ **Outbreak Monitoring** - Monitoring outbreak penyakit secara real-time
- ✅ **Country Comparison** - Perbandingan data kesehatan antar negara
- ✅ **Real-time Updates** - Update data kesehatan secara otomatis

## 🛠 Teknologi

- **Next.js 14** - Framework React dengan App Router
- **Tailwind CSS 3.4** - Styling modern dan responsif
- **Prisma** - ORM untuk database
- **SQLite** - Database (dapat diganti dengan PostgreSQL/MySQL)
- **Server-Sent Events (SSE)** - Real-time streaming data
- **TypeScript** - Type safety
- **Recharts** - Visualisasi data
- **Lucide React** - Icons

## 📊 Struktur Data

### Health Indicator
```json
{
  "country": "Indonesia",
  "indicator": "Total Cases",
  "value": 1000000,
  "category": "disease",
  "date": "2024-12-10",
  "isAlert": false
}
```

### Health Update Event
```json
{
  "country": "Indonesia",
  "indicator": "Total Cases",
  "value": 1000000,
  "change": 5000,
  "timestamp": 1712341111
}
```

## 🚀 Instalasi

1. Install dependencies:
```bash
npm install
```

2. Setup environment variables:
Buat file `.env` di root project:
```env
DATABASE_URL="file:./dev.db"
WHO_API_URL="https://ghoapi.azureedge.net/api"  # Optional: WHO API URL
```

3. Setup database:
```bash
npx prisma generate
npx prisma migrate dev --name init_who_health
```

4. Jalankan development server:
```bash
npm run dev
```

5. Buka browser di [http://localhost:3000](http://localhost:3000)

## 📡 API Endpoints

### Health Data
- `GET /api/who/health` - Get all health indicators
- `GET /api/who/health?country=Indonesia` - Get health indicators by country
- `POST /api/who/health` - Create health indicator

### Outbreaks
- `GET /api/who/outbreaks` - Get active outbreak alerts

### Streaming
- `GET /api/who/stream` - SSE stream for real-time health data updates

## 🔄 Real-time Streaming

Aplikasi menggunakan Server-Sent Events (SSE) untuk streaming data real-time:
- Update otomatis setiap 5 detik
- Auto-reconnect jika koneksi terputus
- Update langsung tampil di dashboard

## 📝 Note

**Mock Data**: Saat ini aplikasi menggunakan mock data untuk simulasi. Untuk production, ganti fungsi di `lib/who-api.ts` dengan API call ke WHO Global Health Observatory API.

WHO API yang bisa digunakan:
- Global Health Observatory (GHO) API: https://ghoapi.azureedge.net/api
- Health Topics API
- Country Data API

## 🎨 UI Features

- **Modern White Theme** - Clean dan professional
- **Gradient Area Charts** - Visualisasi data yang menarik
- **Real-time Updates** - Live feed update data
- **Responsive Design** - Mobile-friendly
- **Smooth Animations** - Transisi yang halus

## 📚 Dokumentasi

- [PROJECT_IDEA.md](./PROJECT_IDEA.md) - Detail ide dan konsep proyek
- [SETUP.md](./SETUP.md) - Panduan setup lengkap

## 🤝 Kontribusi

Silakan buat issue atau pull request untuk perbaikan dan fitur baru.
