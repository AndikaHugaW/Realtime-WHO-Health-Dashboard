# WHO API Integration Guide

## Data Sources

Aplikasi ini mengintegrasikan data dari WHO (World Health Organization) menggunakan beberapa sumber:

### 1. WHO Global Health Observatory (GHO) API
- **Base URL**: `https://ghoapi.azureedge.net/api`
- **Endpoint**: `/MORT_100`, `/COUNTRY`, dll
- **Format**: JSON
- **Fitur**: Data indikator kesehatan global, mortality, dll

### 2. WHO Athena Data Query API
- **Base URL**: `https://apps.who.int/gho/athena/api`
- **Fitur**: Query data kesehatan dengan filter

### 3. Fallback Data
Jika WHO API tidak tersedia atau error, aplikasi menggunakan:
- Enhanced mock data dengan nilai realistis
- Data berdasarkan statistik kesehatan umum
- Auto-fallback untuk mencegah error

## Implementasi

### Fetching Data
```typescript
// Di lib/who-api.ts
const data = await WHO_API.getHealthIndicators(country);

// Akan:
// 1. Mencoba fetch dari WHO GHO API
// 2. Transform data ke format aplikasi
// 3. Fallback ke enhanced mock data jika API gagal
```

### Caching Strategy
- Data dari WHO API di-cache di database
- Update otomatis setiap kali API dipanggil
- Menggunakan data cached jika API tidak tersedia

## Struktur Data WHO

WHO API mengembalikan data dalam format:
```json
{
  "value": [
    {
      "SpatialDim": "Country Code",
      "Indicator": "Indicator Name",
      "NumericValue": 1234,
      "TimeDim": "2024",
      ...
    }
  ]
}
```

Di-transform menjadi format aplikasi:
```json
{
  "country": "Indonesia",
  "indicator": "Total Cases",
  "value": 1234,
  "category": "disease",
  "date": "2024-12-10",
  "isAlert": false
}
```

## Testing WHO API

Untuk test koneksi ke WHO API, jalankan:
```bash
curl https://ghoapi.azureedge.net/api/MORT_100
```

## Catatan

1. **Rate Limiting**: WHO API mungkin memiliki rate limit
2. **CORS**: Pastikan API bisa diakses dari browser (mungkin perlu proxy)
3. **Error Handling**: Semua error sudah ditangani dengan fallback
4. **Data Real**: Aplikasi akan otomatis menggunakan data real jika API tersedia

## Environment Variables

```env
WHO_API_URL=https://ghoapi.azureedge.net/api
```

## Troubleshooting

Jika data tidak muncul:
1. Check console untuk error API
2. Pastikan koneksi internet tersedia
3. Data akan otomatis fallback ke mock data
4. Check database untuk cached data

