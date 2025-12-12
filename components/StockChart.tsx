'use client';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface Medicine {
  id: string;
  medicineId: string;
  name: string;
  stock: number;
  minStock: number;
  maxStock: number;
}

interface StockChartProps {
  medicines: Medicine[];
}

export default function StockChart({ medicines }: StockChartProps) {
  // Jika ada obat dengan stok rendah, tampilkan yang stok rendah
  // Jika tidak ada, tampilkan semua obat dengan sorting berdasarkan stok terendah
  const lowStockMedicines = medicines.filter((m) => m.stock <= m.minStock);
  const chartData = (lowStockMedicines.length > 0 
    ? lowStockMedicines 
    : medicines
  )
    .sort((a, b) => {
      // Sort: stok rendah dulu, lalu berdasarkan stok ascending
      if (a.stock <= a.minStock && b.stock > b.minStock) return -1;
      if (a.stock > a.minStock && b.stock <= b.minStock) return 1;
      return a.stock - b.stock;
    })
    .slice(0, 10)
    .map((medicine) => ({
      name: medicine.name.length > 15 ? medicine.name.substring(0, 15) + '...' : medicine.name,
      'Stok Saat Ini': medicine.stock,
      'Stok Minimum': medicine.minStock,
      'ID': medicine.medicineId,
      isLowStock: medicine.stock <= medicine.minStock,
    }));

  const hasLowStock = lowStockMedicines.length > 0;
  const hasData = chartData.length > 0;

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">
            Grafik Stok Obat
          </h2>
          <p className="text-sm text-gray-500">
            {hasLowStock 
              ? `Menampilkan ${lowStockMedicines.length} obat dengan stok rendah`
              : 'Menampilkan stok obat terbaru (Top 10)'
            }
          </p>
        </div>
      </div>
      {hasData ? (
        <div className="animate-fade-in">
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart 
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              <defs>
                <linearGradient id="colorStock" x1="0" y1="0" x2="0" y2="1">
                  <stop 
                    offset="0%" 
                    stopColor={hasLowStock ? "#dc2626" : "#2563eb"} 
                    stopOpacity={0.8}
                  />
                  <stop 
                    offset="50%" 
                    stopColor={hasLowStock ? "#ef4444" : "#3b82f6"} 
                    stopOpacity={0.5}
                  />
                  <stop 
                    offset="100%" 
                    stopColor={hasLowStock ? "#f87171" : "#60a5fa"} 
                    stopOpacity={0.1}
                  />
                </linearGradient>
                <linearGradient id="colorMin" x1="0" y1="0" x2="0" y2="1">
                  <stop 
                    offset="0%" 
                    stopColor="#f59e0b" 
                    stopOpacity={0.6}
                  />
                  <stop 
                    offset="50%" 
                    stopColor="#fbbf24" 
                    stopOpacity={0.3}
                  />
                  <stop 
                    offset="100%" 
                    stopColor="#fcd34d" 
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="#e5e7eb" 
                strokeWidth={1}
                opacity={0.6}
                horizontal={true}
              />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12, fill: '#374151', fontWeight: 500 }}
                axisLine={{ stroke: '#d1d5db', strokeWidth: 1 }}
                tickLine={{ stroke: '#d1d5db' }}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: '#374151', fontWeight: 500 }}
                axisLine={{ stroke: '#d1d5db', strokeWidth: 1 }}
                tickLine={{ stroke: '#d1d5db' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.98)',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  padding: '10px 12px',
                }}
                formatter={(value: any, name: string) => {
                  if (name === 'ID') return null;
                  return [value, name];
                }}
                labelFormatter={(label, payload) => {
                  if (payload && payload[0] && payload[0].payload) {
                    return `${payload[0].payload.ID} - ${label}`;
                  }
                  return label;
                }}
              />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="circle"
                iconSize={10}
                formatter={(value) => <span style={{ fontSize: '13px', color: '#374151', fontWeight: 500 }}>{value}</span>}
              />
              <Area
                type="monotone"
                dataKey="Stok Saat Ini"
                stroke={hasLowStock ? "#dc2626" : "#2563eb"}
                strokeWidth={2.5}
                fill="url(#colorStock)"
                name="Stok Saat Ini"
                dot={false}
                activeDot={{ r: 5, fill: hasLowStock ? "#dc2626" : "#2563eb", strokeWidth: 2, stroke: '#fff' }}
              />
              <Area
                type="monotone"
                dataKey="Stok Minimum"
                stroke="#f59e0b"
                strokeWidth={2}
                strokeDasharray="5 5"
                fill="url(#colorMin)"
                name="Stok Minimum"
                dot={false}
                activeDot={{ r: 4, fill: "#f59e0b", strokeWidth: 2, stroke: '#fff' }}
              />
            </AreaChart>
          </ResponsiveContainer>
          {hasLowStock && (
            <div className="mt-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-400 rounded-lg animate-fade-in">
              <p className="text-sm text-yellow-800 flex items-center gap-2">
                <span className="text-lg">⚠️</span>
                <span><strong>Peringatan:</strong> Ada obat dengan stok di bawah minimum. Segera lakukan reorder!</span>
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center justify-center h-[400px] text-gray-400">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <p className="text-lg font-semibold mb-1 text-gray-600">Tidak Ada Data Obat</p>
            <p className="text-sm text-gray-500">Silakan tambahkan obat untuk melihat grafik</p>
          </div>
        </div>
      )}
    </div>
  );
}

