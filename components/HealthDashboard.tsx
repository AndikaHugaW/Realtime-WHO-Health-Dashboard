'use client';

import { useEffect, useState } from 'react';
import { Activity, Globe2, AlertTriangle, TrendingUp, Users2, HeartPulse, ShieldCheck, Radar } from 'lucide-react';
import HealthChart from './HealthChart';
import HealthBarChart from './HealthBarChart';
import CategoryDistribution from './CategoryDistribution';
import HealthTrendChart from './HealthTrendChart';
import RecentHealthUpdates from './RecentHealthUpdates';
import OutbreakAlerts from './OutbreakAlerts';
import CountryComparison from './CountryComparison';
import { HealthUpdateEvent } from '@/lib/realtime';

interface HealthIndicator {
  id?: string;
  country: string;
  indicator: string;
  value: number;
  category?: string;
  date?: string;
  isAlert?: boolean;
}

interface DashboardProps {
  recentUpdates: HealthUpdateEvent[];
}

export default function HealthDashboard({ recentUpdates }: DashboardProps) {
  const [indicators, setIndicators] = useState<HealthIndicator[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCountries: 0,
    totalCases: 0,
    activeOutbreaks: 0,
    avgRecoveryRate: 0,
  });

  useEffect(() => {
    fetchHealthData();
    const interval = setInterval(fetchHealthData, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (recentUpdates.length > 0) {
      const timeoutId = setTimeout(() => {
        fetchHealthData();
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [recentUpdates]);

  useEffect(() => {
    calculateStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [indicators]);

  const fetchHealthData = async () => {
    try {
      const response = await fetch('/api/who/health');
      const data = await response.json();
      setIndicators(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching health data:', error);
      setLoading(false);
    }
  };

  const calculateStats = () => {
    const safeIndicators = Array.isArray(indicators) ? indicators : [];
    
    const countries = new Set(safeIndicators.map((i) => i.country)).size;
    const totalCases = safeIndicators
      .filter((i) => i && i.indicator === 'Total Cases')
      .reduce((sum, i) => sum + (i.value || 0), 0);
    
    // Mock avg recovery rate calculation
    const recoveryRate = safeIndicators
      .filter((i) => i && i.indicator === 'Recovered')
      .reduce((sum, i, _, arr) => sum + ((i.value || 0) / (arr.length || 1)), 0);

    setStats({
      totalCountries: countries,
      totalCases: Math.floor(totalCases),
      activeOutbreaks: 0, // Will be updated from outbreaks API
      avgRecoveryRate: Math.floor(recoveryRate / 1000),
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Memuat data kesehatan...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Negara"
          value={stats.totalCountries}
          icon={<Globe2 className="w-6 h-6" />}
          color="blue"
        />
        <StatCard
          title="Total Kasus"
          value={stats.totalCases.toLocaleString('id-ID')}
          icon={<Users2 className="w-6 h-6" />}
          color="red"
        />
        <StatCard
          title="Outbreak Aktif"
          value={stats.activeOutbreaks}
          icon={<Radar className="w-6 h-6" />}
          color="orange"
        />
        <StatCard
          title="Rate Recovery"
          value={`${stats.avgRecoveryRate}%`}
          icon={<HeartPulse className="w-6 h-6" />}
          color="green"
        />
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <HealthChart indicators={indicators} />
        <HealthBarChart indicators={indicators} />
      </div>

      {/* Secondary Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoryDistribution indicators={indicators} />
        <HealthTrendChart indicators={indicators} />
      </div>

      {/* Updates and Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentHealthUpdates updates={recentUpdates} />
        <OutbreakAlerts />
      </div>

      {/* Country Comparison */}
      <div className="grid grid-cols-1 gap-6">
        <CountryComparison indicators={indicators as any} />
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: 'blue' | 'red' | 'green' | 'orange';
}

function StatCard({ title, value, icon, color }: StatCardProps) {
  const colorConfig = {
    blue: {
      iconBg: 'bg-blue-500/20',
      iconColor: 'text-blue-400',
      borderColor: 'border-border',
    },
    red: {
      iconBg: 'bg-red-500/20',
      iconColor: 'text-red-400',
      borderColor: 'border-border',
    },
    green: {
      iconBg: 'bg-green-500/20',
      iconColor: 'text-green-400',
      borderColor: 'border-border',
    },
    orange: {
      iconBg: 'bg-orange-500/20',
      iconColor: 'text-orange-400',
      borderColor: 'border-border',
    },
  };

  const config = colorConfig[color];

  return (
    <div className={`bg-card rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 p-6 border ${config.borderColor}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-muted-foreground text-sm font-medium mb-2">{title}</p>
          <p className="text-3xl font-bold text-foreground">{value}</p>
        </div>
        <div className={`${config.iconBg} ${config.iconColor} p-3 rounded-lg`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

