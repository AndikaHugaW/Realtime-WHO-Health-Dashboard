# WHO Health Data Streaming Dashboard - Project Idea

## Konsep Proyek

**WHO Real-time Health Monitoring Dashboard** - Dashboard real-time untuk monitoring data kesehatan global dari World Health Organization (WHO).

## Fitur Utama

### 1. **Global Health Statistics Dashboard**
- Real-time data statistik kesehatan global
- Metrics: Total kasus penyakit, kematian, pemulihan
- Tracking per negara
- Trend data historis

### 2. **Disease Outbreak Monitoring**
- Monitoring outbreak penyakit secara real-time
- Alert system untuk penyakit yang berpotensi pandemi
- Tracking penyebaran penyakit antar negara
- Timeline outbreak

### 3. **Country Health Comparison**
- Perbandingan data kesehatan antar negara
- Ranking negara berdasarkan indikator kesehatan
- Visualisasi perbandingan menggunakan charts

### 4. **Health Topics & News**
- Streaming news dan update dari WHO
- Health topics yang trending
- Rekomendasi kesehatan berdasarkan data terbaru

### 5. **Real-time Data Updates**
- Server-Sent Events (SSE) untuk update real-time
- Auto-refresh data setiap interval tertentu
- Notifikasi untuk update penting

## Data Source

### WHO APIs yang Tersedia:
1. **WHO Global Health Observatory (GHO) API**
   - Data indikator kesehatan global
   - Statistik per negara
   
2. **WHO Health Topics API**
   - Informasi tentang berbagai topik kesehatan
   
3. **WHO Country Data API**
   - Data kesehatan per negara
   - Indicators dan metrics

### Alternatif (jika WHO API terbatas):
- **COVID-19 API** (jika fokus pandemi)
- **Disease Outbreak News** (RSS/API)
- **Mock Data** untuk development (selanjutnya bisa diganti dengan API real)

## Technology Stack

- **Next.js 14** - Framework React
- **Tailwind CSS** - Styling
- **Recharts** - Data visualization
- **Server-Sent Events (SSE)** - Real-time streaming
- **TypeScript** - Type safety
- **WHO API / Mock API** - Data source

## Use Cases

1. **Researcher/Health Professional**
   - Monitor tren kesehatan global
   - Analisis data untuk penelitian
   - Tracking outbreak penyakit

2. **Government/Policy Maker**
   - Data untuk keputusan kebijakan kesehatan
   - Monitoring situasi kesehatan global
   - Perbandingan dengan negara lain

3. **General Public**
   - Informasi kesehatan terkini
   - Alert untuk outbreak
   - Awareness tentang kesehatan global

## Implementasi

Karena WHO API mungkin memerlukan authentication dan akses terbatas, kita akan:
1. Membuat mock API endpoint yang mensimulasikan data WHO
2. Menggunakan struktur data yang mirip dengan WHO API
3. Implementasi SSE untuk streaming data real-time
4. Dashboard yang siap untuk diintegrasikan dengan WHO API real nantinya

## Struktur Data

```json
{
  "country": "Indonesia",
  "indicator": "Total Cases",
  "value": 1000000,
  "date": "2024-12-10",
  "category": "disease",
  "alert": false
}
```

