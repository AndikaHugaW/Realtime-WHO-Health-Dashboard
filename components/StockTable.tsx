'use client';

import { useState } from 'react';
import { Package, Plus, Minus } from 'lucide-react';

interface Medicine {
  id: string;
  medicineId: string;
  name: string;
  stock: number;
  minStock: number;
  maxStock: number;
  price: number;
  expiryDate: string;
}

interface StockTableProps {
  medicines: Medicine[];
  onUpdate: () => void;
}

export default function StockTable({ medicines, onUpdate }: StockTableProps) {
  const [updating, setUpdating] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<{ [key: string]: string }>({});

  const updateStock = async (medicineId: string, event: 'sold' | 'added') => {
    const qty = parseInt(quantity[medicineId] || '1');
    if (isNaN(qty) || qty <= 0) {
      alert('Masukkan jumlah yang valid');
      return;
    }

    setUpdating(medicineId);
    try {
      const response = await fetch(`/api/medicines/${medicineId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ event, quantity: qty }),
      });

      if (response.ok) {
        setQuantity({ ...quantity, [medicineId]: '' });
        onUpdate();
      } else {
        const error = await response.json();
        alert(error.error || 'Gagal memperbarui stok');
      }
    } catch (error) {
      console.error('Error updating stock:', error);
      alert('Terjadi kesalahan');
    } finally {
      setUpdating(null);
    }
  };

  const getStockStatus = (stock: number, minStock: number) => {
    if (stock === 0) return { color: 'bg-red-100 text-red-800', label: 'Habis' };
    if (stock <= minStock) return { color: 'bg-yellow-100 text-yellow-800', label: 'Rendah' };
    return { color: 'bg-green-100 text-green-800', label: 'Aman' };
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Daftar Obat
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">Kelola stok obat</p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg text-xs font-medium">
          <span>💡</span>
          <span>Masukkan jumlah, lalu klik tombol</span>
        </div>
      </div>
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-gray-200 dark:border-gray-700">
              <th className="text-left py-4 px-4 text-gray-600 dark:text-gray-400 font-semibold text-sm uppercase tracking-wider">
                ID Obat
              </th>
              <th className="text-left py-4 px-4 text-gray-600 dark:text-gray-400 font-semibold text-sm uppercase tracking-wider">
                Nama
              </th>
              <th className="text-left py-4 px-4 text-gray-600 dark:text-gray-400 font-semibold text-sm uppercase tracking-wider">
                Stok
              </th>
              <th className="text-left py-4 px-4 text-gray-600 dark:text-gray-400 font-semibold text-sm uppercase tracking-wider">
                Status
              </th>
              <th className="text-left py-4 px-4 text-gray-600 dark:text-gray-400 font-semibold text-sm uppercase tracking-wider">
                Harga
              </th>
              <th className="text-left py-4 px-4 text-gray-600 dark:text-gray-400 font-semibold text-sm uppercase tracking-wider">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody>
            {medicines.map((medicine) => {
              const status = getStockStatus(medicine.stock, medicine.minStock);
              return (
                <tr
                  key={medicine.id}
                  className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors duration-150"
                >
                  <td className="py-4 px-4">
                    <span className="text-gray-900 dark:text-white font-mono text-sm font-medium bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                      {medicine.medicineId}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-gray-900 dark:text-white font-medium">{medicine.name}</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-gray-900 dark:text-white font-semibold">
                      {medicine.stock}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400 text-sm"> / {medicine.maxStock}</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${status.color} shadow-sm`}>
                      {status.label}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-gray-900 dark:text-white font-medium">
                      Rp {medicine.price.toLocaleString('id-ID')}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        placeholder="Qty"
                        value={quantity[medicine.medicineId] || ''}
                        onChange={(e) =>
                          setQuantity({ ...quantity, [medicine.medicineId]: e.target.value })
                        }
                        className="w-20 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                      <button
                        onClick={() => updateStock(medicine.medicineId, 'sold')}
                        disabled={updating === medicine.medicineId}
                        className="p-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md transition-all duration-200"
                        title="Jual"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => updateStock(medicine.medicineId, 'added')}
                        disabled={updating === medicine.medicineId}
                        className="p-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md transition-all duration-200"
                        title="Tambah Stok"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

