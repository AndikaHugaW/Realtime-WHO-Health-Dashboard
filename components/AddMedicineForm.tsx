'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';

interface AddMedicineFormProps {
  onSuccess: () => void;
}

export default function AddMedicineForm({ onSuccess }: AddMedicineFormProps) {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    medicineId: '',
    name: '',
    stock: '0',
    minStock: '10',
    maxStock: '100',
    price: '',
    expiryDate: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/medicines', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          medicineId: formData.medicineId,
          name: formData.name,
          stock: parseInt(formData.stock),
          minStock: parseInt(formData.minStock),
          maxStock: parseInt(formData.maxStock),
          price: parseFloat(formData.price),
          expiryDate: formData.expiryDate,
        }),
      });

      if (response.ok) {
        const newMedicine = await response.json();
        setFormData({
          medicineId: '',
          name: '',
          stock: '0',
          minStock: '10',
          maxStock: '100',
          price: '',
          expiryDate: '',
        });
        setShowForm(false);
        onSuccess();
        
        // Show success message with medicine details
        const message = newMedicine.stock > 0
          ? `Obat "${newMedicine.name}" berhasil ditambahkan dengan stok ${newMedicine.stock}! Update real-time akan muncul dalam beberapa detik.`
          : `Obat "${newMedicine.name}" berhasil ditambahkan!`;
        alert(message);
      } else {
        const error = await response.json();
        alert(error.error || 'Gagal menambahkan obat');
      }
    } catch (error) {
      console.error('Error adding medicine:', error);
      alert('Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="mb-6 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200 font-semibold"
      >
        <Plus className="w-5 h-5" />
        Tambah Obat Baru
      </button>
    );
  }

  return (
    <div className="mb-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
          <Plus className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Tambah Obat Baru
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">Isi form di bawah</p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              ID Obat *
            </label>
            <input
              type="text"
              required
              value={formData.medicineId}
              onChange={(e) => setFormData({ ...formData, medicineId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="OBT-001"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nama Obat *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Paracetamol 500mg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Stok Awal *
            </label>
            <input
              type="number"
              required
              min="0"
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Stok Minimum *
            </label>
            <input
              type="number"
              required
              min="1"
              value={formData.minStock}
              onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Stok Maksimum *
            </label>
            <input
              type="number"
              required
              min="1"
              value={formData.maxStock}
              onChange={(e) => setFormData({ ...formData, maxStock: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Harga (Rp) *
            </label>
            <input
              type="number"
              required
              min="0"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tanggal Kadaluarsa *
            </label>
            <input
              type="date"
              required
              value={formData.expiryDate}
              onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 shadow-md hover:shadow-lg transition-all duration-200 font-semibold"
          >
            {loading ? 'Menyimpan...' : 'Simpan'}
          </button>
          <button
            type="button"
            onClick={() => setShowForm(false)}
            className="px-6 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200 font-medium"
          >
            Batal
          </button>
        </div>
      </form>
    </div>
  );
}

