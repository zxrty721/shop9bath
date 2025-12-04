import { useState, useMemo } from 'react';
import {
  Users,
  Package,
  Server,
  Activity,
  Shield,
  AlertTriangle,
  Layers,
  DollarSign,
  TrendingUp,
  ShoppingBag,
} from 'lucide-react';
import { type DashboardStats } from '../../types';

interface OverviewProps {
  stats: DashboardStats;
  loading: boolean;
}

const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
  loading,
  isCurrency = false,
}: any) => (
  // ✅ แก้สี: bg-slate-900 -> bg-zinc-900, border-slate -> border-zinc
  <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] dark:shadow-none hover:shadow-lg transition-all duration-300 group relative overflow-hidden">
    <div
      className={`absolute top-0 right-0 w-24 h-24 bg-linear-to-br ${color} opacity-10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110`}
    />
    <div className="flex justify-between items-start relative z-10">
      <div>
        <p className="text-zinc-500 dark:text-zinc-400 text-xs font-bold uppercase tracking-wider mb-2">
          {title}
        </p>
        {loading ? (
          <div className="h-8 w-24 bg-zinc-100 dark:bg-zinc-800 rounded-lg animate-pulse mb-1"></div>
        ) : (
          <h3 className="text-3xl font-bold text-zinc-800 dark:text-white tracking-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            {isCurrency ? '฿' : ''}
            {value?.toLocaleString(undefined, {
              minimumFractionDigits: 0,
              maximumFractionDigits: 2,
            }) || '0'}
          </h3>
        )}
        <p className="text-xs text-zinc-400 dark:text-zinc-500 font-medium mt-2">
          {subtitle}
        </p>
      </div>
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm ${color} text-white`}
      >
        <Icon size={24} />
      </div>
    </div>
  </div>
);

export default function Overview({ stats, loading }: OverviewProps) {
  const [salesPeriod, setSalesPeriod] = useState<
    'day' | 'month' | 'year' | 'all'
  >('day');

  const getTotalOrders = () => {
    const anyStats = stats as any;
    return (
      anyStats.total_orders ??
      anyStats.total_orders_count ??
      anyStats.orders_count ??
      0
    );
  };

  const currentSales = useMemo(() => {
    switch (salesPeriod) {
      case 'day':
        return {
          title: 'ยอดขายวันนี้',
          value: stats.today_sales,
          sub: 'Daily Revenue',
        };
      case 'month':
        return {
          title: 'ยอดขายเดือนนี้',
          value: stats.monthly_sales,
          sub: 'Monthly Revenue',
        };
      case 'year':
        return {
          title: 'ยอดขายปีนี้',
          value: stats.yearly_sales,
          sub: 'Yearly Revenue',
        };
      case 'all':
        return {
          title: 'ยอดขายรวมทั้งหมด',
          value: stats.total_sales,
          sub: 'Total Revenue',
        };
      default:
        return {
          title: 'ยอดขายวันนี้',
          value: stats.today_sales,
          sub: 'Daily Revenue',
        };
    }
  }, [stats, salesPeriod]);

  return (
    <div className="space-y-6 animate-fade-in pb-10 font-prompt">
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h2 className="text-2xl font-bold text-zinc-800 dark:text-white flex items-center gap-2">
            <Activity className="text-indigo-600 dark:text-indigo-400" /> ภาพรวมระบบ
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
            สรุปยอดขายและสถานะทรัพยากรล่าสุด
          </p>
        </div>
        {/* ✅ แก้สีปุ่ม Toggle */}
        <div className="bg-white dark:bg-zinc-900 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800 flex shadow-sm">
          {[
            { id: 'day', label: 'รายวัน' },
            { id: 'month', label: 'รายเดือน' },
            { id: 'year', label: 'รายปี' },
            { id: 'all', label: 'ทั้งหมด' },
          ].map((period) => (
            <button
              key={period.id}
              onClick={() => setSalesPeriod(period.id as any)}
              className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
                salesPeriod === period.id
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'
              }`}
            >
              {period.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          loading={loading}
          title={currentSales.title}
          value={currentSales.value}
          subtitle={currentSales.sub}
          icon={DollarSign}
          color="from-indigo-500 to-violet-600 bg-indigo-500"
          isCurrency
        />
        <StatCard
          loading={loading}
          title="จำนวนออเดอร์รวม"
          value={getTotalOrders()}
          subtitle="Total Transactions"
          icon={ShoppingBag}
          color="from-blue-500 to-cyan-600 bg-blue-500"
        />
        <StatCard
          loading={loading}
          title="รายได้สะสม (All Time)"
          value={stats.total_sales}
          subtitle="Lifetime Revenue"
          icon={TrendingUp}
          color="from-emerald-500 to-teal-600 bg-emerald-500"
          isCurrency
        />
      </div>

      <h3 className="text-lg font-bold text-zinc-700 dark:text-zinc-200 mt-4 flex items-center gap-2">
        <Layers size={20} /> ข้อมูลคลังและผู้ใช้
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          loading={loading}
          title="สินค้าในคลัง"
          value={stats.product_count}
          subtitle="รายการสินค้าทั้งหมด"
          icon={Package}
          color="from-orange-400 to-amber-500 bg-orange-400"
        />
        <StatCard
          loading={loading}
          title="สินค้าใกล้หมด"
          value={stats.low_stock_count}
          subtitle={
            stats.low_stock_count > 0
              ? '⚠️ ควรเติมสต็อกทันที'
              : 'สต็อกปกติ'
          }
          icon={AlertTriangle}
          color={
            stats.low_stock_count > 0
              ? 'from-red-500 to-rose-600 bg-red-500'
              : 'from-zinc-400 to-slate-500 bg-zinc-400'
          }
        />
        <StatCard
          loading={loading}
          title="ผู้ใช้งานระบบ"
          value={stats.user_count}
          subtitle="Active Accounts"
          icon={Users}
          color="from-cyan-500 to-sky-600 bg-cyan-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-2">
        {/* ✅ Server Status Card สีดำ */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm">
          <h3 className="font-bold text-zinc-800 dark:text-white mb-4 flex items-center gap-2">
            <Server size={18} className="text-zinc-400" /> สถานะเซิร์ฟเวอร์
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-zinc-50 dark:border-zinc-800">
              <span className="text-sm text-zinc-500 dark:text-zinc-400">
                Database Status
              </span>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded">
                Online / RAM Cached
              </span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-zinc-50 dark:border-zinc-800">
              <span className="text-sm text-zinc-500 dark:text-zinc-400">Latency</span>
              <span className="text-sm font-bold text-zinc-700 dark:text-zinc-200">
                &lt; 20ms
              </span>
            </div>
          </div>
        </div>
        
        {/* Security Card */}
        <div className="bg-linear-to-br from-zinc-800 to-zinc-900 p-6 rounded-2xl text-white shadow-lg relative overflow-hidden border border-transparent dark:border-zinc-700">
          <Shield className="absolute bottom-5 right-5 text-white opacity-5 w-40 h-40" />
          <h3 className="font-bold text-lg mb-2 relative z-10">
            ระบบความปลอดภัย
          </h3>
          <p className="text-zinc-300 text-sm mb-6 relative z-10">
            RBAC Enabled. Session Active via Redis/Memory.
          </p>
        </div>
      </div>
    </div>
  );
}