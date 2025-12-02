import { DollarSign, ShoppingBag, Users, TrendingUp } from 'lucide-react';

export default function SalesSummary() {
  const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <div className={`bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition-shadow group`}>
      <div>
        <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{value}</h3>
      </div>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={24} className="text-white" />
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">📊 ภาพรวมระบบ</h2>
        <p className="text-slate-500 text-sm mt-1">สรุปยอดขายและสถิติประจำวัน</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <StatCard title="ยอดขายวันนี้" value="฿0.00" icon={DollarSign} color="bg-blue-500" />
        <StatCard title="ออเดอร์ทั้งหมด" value="0" icon={ShoppingBag} color="bg-indigo-500" />
        <StatCard title="ลูกค้าใหม่" value="0" icon={Users} color="bg-teal-500" />
      </div>

      <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-16 text-center">
        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <TrendingUp className="text-slate-300" size={32} />
        </div>
        <h3 className="text-slate-800 font-medium">ยังไม่มีข้อมูลการขาย</h3>
        <p className="text-slate-400 text-sm mt-1">ข้อมูลจะแสดงที่นี่เมื่อมีการทำรายการขายแรก</p>
      </div>
    </div>
  );
}