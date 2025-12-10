import { useMemo } from "react";
import {
    Users,
    Package,
    Server,
    Activity,
    Shield,
    Layers,
    DollarSign,
    TrendingUp,
    ShoppingBag,
    Calendar,
    type LucideIcon,
} from "lucide-react";
import { type DashboardStats, type Order } from "../../types";

interface OverviewProps {
    stats: DashboardStats | null | undefined; // ใช้ข้อมูล user_count/stock จาก stats
    orders: Order[]; // ✅ รับรายการออเดอร์มาคำนวณยอดเงินเอง
    loading: boolean;
    totalProductCount: number;
}

interface StatCardProps {
    title: string;
    value: number | string;
    subtitle: string;
    icon: LucideIcon;
    color: string;
    loading?: boolean;
    isCurrency?: boolean;
}

const StatCard = ({
    title,
    value,
    subtitle,
    icon: Icon,
    color,
    loading,
    isCurrency = false,
}: StatCardProps) => (
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
                        {isCurrency ? "฿" : ""}
                        {Number(value ?? 0).toLocaleString(undefined, {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 2,
                        })}
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

export default function Overview({
    stats,
    orders,
    loading,
    totalProductCount,
}: OverviewProps) {
    // ✅ คำนวณยอดขายสดๆ (Real-time calculation)
    const salesMetrics = useMemo(() => {
        const today = new Date();
        const todayStr = today.toISOString().split("T")[0]; // YYYY-MM-DD
        const currentMonthStr = todayStr.slice(0, 7); // YYYY-MM

        let dailyTotal = 0;
        let monthlyTotal = 0;
        let allTimeTotal = 0;

        orders.forEach((order) => {
            const amount = Number(order.total_amount) || 0;
            const orderDateStr = order.created_at?.split("T")[0] || "";

            // ยอดรวมทั้งหมด
            allTimeTotal += amount;

            // ยอดขายวันนี้
            if (orderDateStr === todayStr) {
                dailyTotal += amount;
            }

            // ยอดขายเดือนนี้
            if (orderDateStr.startsWith(currentMonthStr)) {
                monthlyTotal += amount;
            }
        });

        return { dailyTotal, monthlyTotal, allTimeTotal };
    }, [orders]);

    return (
        <div className="space-y-6 animate-fade-in pb-10 font-prompt">
            <div className="flex flex-col xl:flex-row justify-between items-end xl:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-zinc-800 dark:text-white flex items-center gap-2">
                        <Activity className="text-indigo-600 dark:text-indigo-400" />
                        ภาพรวมระบบ
                    </h2>
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
                        ข้อมูลสรุป ณ วันที่{" "}
                        {new Date().toLocaleDateString("th-TH")}
                    </p>
                </div>
            </div>

            {/* ✅ แสดง 3 การ์ดรวดเดียวจบ (รายวัน / รายเดือน / ทั้งหมด) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    loading={loading}
                    title="ยอดขายวันนี้ (Daily)"
                    value={salesMetrics.dailyTotal}
                    subtitle="Today's Revenue"
                    icon={DollarSign}
                    color="from-indigo-500 to-violet-600 bg-indigo-500"
                    isCurrency
                />
                <StatCard
                    loading={loading}
                    title="ยอดขายเดือนนี้ (Month)"
                    value={salesMetrics.monthlyTotal}
                    subtitle="Monthly Revenue"
                    icon={Calendar}
                    color="from-blue-500 to-cyan-600 bg-blue-500"
                    isCurrency
                />
                <StatCard
                    loading={loading}
                    title="ยอดขายรวม (All Time)"
                    value={salesMetrics.allTimeTotal}
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
                    value={totalProductCount}
                    subtitle="รายการสินค้าทั้งหมด"
                    icon={Package}
                    color="from-orange-400 to-amber-500 bg-orange-400"
                />
                <StatCard
                    loading={loading}
                    title="จำนวนออเดอร์"
                    value={orders.length} // ✅ นับจากจำนวนออเดอร์จริง
                    subtitle="Total Transactions"
                    icon={ShoppingBag}
                    color="from-pink-500 to-rose-600 bg-pink-500"
                />
                <StatCard
                    loading={loading}
                    title="ผู้ใช้งานระบบ"
                    value={stats?.user_count || 0}
                    subtitle="Active Accounts"
                    icon={Users}
                    color="from-cyan-500 to-sky-600 bg-cyan-500"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-2">
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm">
                    <h3 className="font-bold text-zinc-800 dark:text-white mb-4 flex items-center gap-2">
                        <Server size={18} className="text-zinc-400" />{" "}
                        สถานะเซิร์ฟเวอร์
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
                            <span className="text-sm text-zinc-500 dark:text-zinc-400">
                                Latency
                            </span>
                            <span className="text-sm font-bold text-zinc-700 dark:text-zinc-200">
                                &lt; 20ms
                            </span>
                        </div>
                    </div>
                </div>

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
