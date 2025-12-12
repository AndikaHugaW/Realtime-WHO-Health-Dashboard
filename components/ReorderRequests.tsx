'use client';

import { useEffect, useState } from 'react';
import { ShoppingCart, Check, X } from 'lucide-react';

interface ReorderRequest {
  id: string;
  medicineId: string;
  quantity: number;
  status: string;
  createdAt: string;
  medicine: {
    name: string;
    medicineId: string;
  };
}

interface ReorderRequestsProps {
  onUpdate: () => void;
}

export default function ReorderRequests({ onUpdate }: ReorderRequestsProps) {
  const [requests, setRequests] = useState<ReorderRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchRequests();
    const interval = setInterval(fetchRequests, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await fetch('/api/reorder');
      const data = await response.json();
      setRequests(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching reorder requests:', error);
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    setUpdating(id);
    try {
      const response = await fetch('/api/reorder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, status }),
      });

      if (response.ok) {
        fetchRequests();
        onUpdate();
      }
    } catch (error) {
      console.error('Error updating reorder status:', error);
      alert('Gagal memperbarui status');
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <p className="text-gray-500 dark:text-gray-400">Memuat...</p>
      </div>
    );
  }

  const pendingRequests = requests.filter((r) => r.status === 'pending');

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-lg">
          <ShoppingCart className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Permintaan Reorder
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">Otomatis</p>
        </div>
      </div>
      <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
        {pendingRequests.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
              <ShoppingCart className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 font-medium">Tidak ada permintaan reorder</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Semua stok mencukupi</p>
          </div>
        ) : (
          pendingRequests.map((request) => (
            <div
              key={request.id}
              className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-l-4 border-blue-500 rounded-lg hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {request.medicine.name}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    ID: {request.medicine.medicineId} | Jumlah: {request.quantity}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => updateStatus(request.id, 'sent')}
                    disabled={updating === request.id}
                    className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md transition-all duration-200"
                    title="Tandai sebagai Terkirim"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => updateStatus(request.id, 'completed')}
                    disabled={updating === request.id}
                    className="p-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md transition-all duration-200"
                    title="Tandai sebagai Selesai (Update Stok)"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

