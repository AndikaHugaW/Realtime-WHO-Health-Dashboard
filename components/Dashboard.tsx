'use client';

import { useEffect, useState } from 'react';
import { Activity, Package, AlertTriangle, ShoppingCart } from 'lucide-react';
import StockTable from './StockTable';
import RecentUpdates from './RecentUpdates';
import ExpiringMedicines from './ExpiringMedicines';
import ReorderRequests from './ReorderRequests';
import StockChart from './StockChart';
import AddMedicineForm from './AddMedicineForm';
import { StockUpdateEvent } from '@/lib/realtime';

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

interface DashboardProps {
  recentUpdates: StockUpdateEvent[];
}

export default function Dashboard({ recentUpdates }: DashboardProps) {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalMedicines: 0,
    lowStock: 0,
    totalValue: 0,
    pendingReorders: 0,
  });

  useEffect(() => {
    fetchMedicines();
    const interval = setInterval(fetchMedicines, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  // Refresh medicines when real-time updates occur
  useEffect(() => {
    if (recentUpdates.length > 0) {
      // Debounce: only fetch if last update was more than 500ms ago
      const timeoutId = setTimeout(() => {
        fetchMedicines();
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [recentUpdates]);

  useEffect(() => {
    calculateStats();
  }, [medicines]);

  const fetchMedicines = async () => {
    try {
      const response = await fetch('/api/medicines');
      const data = await response.json();
      setMedicines(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching medicines:', error);
      setLoading(false);
    }
  };

  const calculateStats = async () => {
    const totalMedicines = medicines.length;
    const lowStock = medicines.filter((m) => m.stock <= m.minStock).length;
    const totalValue = medicines.reduce((sum, m) => sum + m.stock * m.price, 0);

    try {
      const reorderResponse = await fetch('/api/reorder');
      const reorders = await reorderResponse.json();
      const pendingReorders = reorders.filter((r: any) => r.status === 'pending').length;

      setStats({
        totalMedicines,
        lowStock,
        totalValue,
        pendingReorders,
      });
    } catch (error) {
      console.error('Error fetching reorders:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600 dark:text-gray-300">Memuat data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Add Medicine Form */}
      <AddMedicineForm onSuccess={fetchMedicines} />
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Obat"
          value={stats.totalMedicines}
          icon={<Package className="w-6 h-6" />}
          color="blue"
        />
        <StatCard
          title="Stok Rendah"
          value={stats.lowStock}
          icon={<AlertTriangle className="w-6 h-6" />}
          color="red"
        />
        <StatCard
          title="Nilai Total Inventori"
          value={`Rp ${stats.totalValue.toLocaleString('id-ID')}`}
          icon={<ShoppingCart className="w-6 h-6" />}
          color="green"
        />
        <StatCard
          title="Reorder Pending"
          value={stats.pendingReorders}
          icon={<Activity className="w-6 h-6" />}
          color="yellow"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StockChart medicines={medicines} />
        <RecentUpdates updates={recentUpdates} />
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ExpiringMedicines />
        <ReorderRequests onUpdate={fetchMedicines} />
      </div>

      {/* Stock Table */}
      <StockTable medicines={medicines} onUpdate={fetchMedicines} />
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: 'blue' | 'red' | 'green' | 'yellow';
}

function StatCard({ title, value, icon, color }: StatCardProps) {
  const colorConfig = {
    blue: {
      bg: 'bg-gradient-to-br from-blue-500 to-blue-600',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      accent: 'from-blue-500/20 to-blue-600/20',
    },
    red: {
      bg: 'bg-gradient-to-br from-red-500 to-red-600',
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      accent: 'from-red-500/20 to-red-600/20',
    },
    green: {
      bg: 'bg-gradient-to-br from-green-500 to-green-600',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      accent: 'from-green-500/20 to-green-600/20',
    },
    yellow: {
      bg: 'bg-gradient-to-br from-yellow-500 to-yellow-600',
      iconBg: 'bg-yellow-100',
      iconColor: 'text-yellow-600',
      accent: 'from-yellow-500/20 to-yellow-600/20',
    },
  };

  const config = colorConfig[color];

  return (
    <div className="group relative overflow-hidden bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100">
      {/* Gradient accent */}
      <div className={`absolute inset-0 bg-gradient-to-br ${config.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
      
      <div className="relative flex items-center justify-between">
        <div className="flex-1">
          <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`${config.iconBg} ${config.iconColor} p-4 rounded-xl shadow-sm`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

