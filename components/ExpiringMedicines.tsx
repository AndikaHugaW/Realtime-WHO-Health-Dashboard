'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, Calendar } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';

interface Medicine {
  id: string;
  medicineId: string;
  name: string;
  stock: number;
  expiryDate: string;
}

export default function ExpiringMedicines() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExpiringMedicines();
    const interval = setInterval(fetchExpiringMedicines, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchExpiringMedicines = async () => {
    try {
      const response = await fetch('/api/expiring');
      const data = await response.json();
      setMedicines(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching expiring medicines:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <p className="text-gray-500 dark:text-gray-400">Memuat...</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 rounded-lg">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Obat Akan Kadaluarsa
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">≤30 hari</p>
        </div>
      </div>
      <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
        {medicines.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 font-medium">Tidak ada obat yang akan kadaluarsa</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Semua obat masih aman</p>
          </div>
        ) : (
          medicines.map((medicine) => {
            const expiryDate = new Date(medicine.expiryDate);
            const daysLeft = differenceInDays(expiryDate, new Date());
            const isExpired = daysLeft < 0;

            return (
              <div
                key={medicine.id}
                className={`p-4 rounded-lg border-l-4 transition-all duration-200 hover:shadow-md ${
                  isExpired
                    ? 'bg-gradient-to-r from-red-50 to-red-100/50 dark:from-red-900/20 dark:to-red-800/10 border-red-500'
                    : 'bg-gradient-to-r from-yellow-50 to-yellow-100/50 dark:from-yellow-900/20 dark:to-yellow-800/10 border-yellow-500'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{medicine.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      ID: {medicine.medicineId} | Stok: {medicine.stock}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4" />
                      <span className={isExpired ? 'text-red-600 font-bold' : 'text-yellow-600'}>
                        {isExpired ? 'Kadaluarsa' : `${daysLeft} hari lagi`}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {format(expiryDate, 'dd/MM/yyyy')}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

