import { useState, useMemo } from 'react';
import { type Order } from '../../types';
import {
  FileText,
  Calendar,
  DollarSign,
  Package,
  ChevronDown,
  Search,
  X,
} from 'lucide-react';

interface TransactionHistoryProps {
  orders: Order[];
  loading: boolean;
}

export default function TransactionHistory({
  orders,
  loading,
}: TransactionHistoryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  // ✅ High Performance Filtering Logic
  const filteredOrders = useMemo(() => {
    // 1. Prepare Search Term (ทำ Lowercase ทีเดียวนอก Loop)
    const lowerSearchTerm = searchTerm.toLowerCase();
    
    // 2. Prepare Date Filter (ถ้าไม่มีค่า ให้เป็น null เพื่อข้ามเร็วๆ)
    const targetDate = filterDate ? filterDate : null;

    return orders.filter((order) => {
      // 🚀 Optimization 1: Check Date String Directly (Fastest)
      // เช็ค String ตรงๆ แทนการ new Date() ซึ่งกินแรมและ CPU
      // สมมติ order.created_at เป็น "2023-12-05T10:00:00Z"
      // เราเช็คว่ามันขึ้นต้นด้วย "2023-12-05" หรือไม่
      if (targetDate && order.created_at && !order.created_at.startsWith(targetDate)) {
        return false;
      }

      // 🚀 Optimization 2: Fast Search Exit
      // ถ้าไม่มี Search Term ก็ผ่านเลย ไม่ต้องเช็คต่อ
      if (!lowerSearchTerm) return true;

      // 3. Search Matching
      return (
        order.id.toString().includes(lowerSearchTerm) ||
        (order.items && order.items.some((i) => 
          (i.product_name || '').toLowerCase().includes(lowerSearchTerm)
        ))
      );
    });
  }, [orders, searchTerm, filterDate]);

  if (loading)
    return (
      <div className="p-10 text-center text-zinc-400 dark:text-zinc-500 animate-pulse">
        กำลังโหลดข้อมูล...
      </div>
    );

  return (
    <div className="space-y-6 animate-fade-in pb-10 font-prompt">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white dark:bg-black p-6 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-800 transition-colors duration-300">
        <div>
          <h2 className="text-2xl font-bold text-zinc-800 dark:text-white flex items-center gap-2">
            <FileText className="text-indigo-600 dark:text-indigo-400" /> ประวัติการขาย
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
            รายการคำสั่งซื้อทั้งหมด ({filteredOrders.length})
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          {/* ✅ Date Filter Input */}
          <div className="relative group flex-1">
            <Calendar
              className="absolute left-3 top-2.5 text-zinc-400 pointer-events-none"
              size={18}
            />
            <input
              type="date"
              className="w-full pl-10 pr-10 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm transition-all focus:bg-white dark:focus:bg-black focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900 text-zinc-800 dark:text-white outline-none cursor-pointer"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            />
            {/* ปุ่ม Clear Date (แสดงเมื่อมีการเลือกวันที่) */}
            {filterDate && (
              <button
                onClick={() => setFilterDate('')}
                className="absolute right-3 top-2.5 text-zinc-400 hover:text-red-500 transition-colors"
              >
                <X size={18} />
              </button>
            )}
          </div>

          {/* Search Input */}
          <div className="relative group flex-1 md:w-64">
            <Search
              className="absolute left-3 top-2.5 text-zinc-400 pointer-events-none"
              size={18}
            />
            <input
              type="text"
              placeholder="ค้นหาเลข Order / สินค้า..."
              className="w-full pl-10 pr-10 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none focus:bg-white dark:focus:bg-black focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900 text-sm transition-all text-zinc-800 dark:text-white placeholder:text-zinc-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
             {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-2.5 text-zinc-400 hover:text-red-500 transition-colors"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-700">
            <FileText
              size={48}
              className="mx-auto text-zinc-300 dark:text-zinc-600 mb-2"
            />
            <p className="text-zinc-400 dark:text-zinc-500">
              ไม่พบประวัติการขาย {filterDate ? `วันที่ ${new Date(filterDate).toLocaleDateString('th-TH')}` : ''}
            </p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm overflow-hidden transition-all hover:shadow-md hover:border-indigo-100 dark:hover:border-indigo-900"
            >
              <div
                onClick={() => toggleExpand(order.id)}
                className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer bg-white dark:bg-zinc-900 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white transition-colors ${
                      expandedId === order.id
                        ? 'bg-indigo-600 dark:bg-indigo-500 shadow-md scale-110'
                        : 'bg-zinc-400 dark:bg-zinc-600'
                    }`}
                  >
                    #{order.id}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400 mb-1">
                      <Calendar size={14} />{' '}
                      {order.created_at
                        ? new Date(order.created_at).toLocaleString('th-TH')
                        : '-'}
                    </div>
                    <div className="font-bold text-zinc-800 dark:text-white">
                      Bill ID: {order.id}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-6 flex-1">
                  <div className="text-right">
                    <p className="text-xs text-zinc-400 dark:text-zinc-500 uppercase font-bold">
                      ยอดสุทธิ
                    </p>
                    <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 justify-end">
                      <DollarSign size={16} />{' '}
                      {order.total_amount.toLocaleString()}
                    </p>
                  </div>
                  <div
                    className="text-zinc-400 dark:text-zinc-500 transition-transform duration-300"
                    style={{
                      transform:
                        expandedId === order.id
                          ? 'rotate(180deg)'
                          : 'rotate(0deg)',
                    }}
                  >
                    <ChevronDown />
                  </div>
                </div>
              </div>

              {expandedId === order.id && (
                <div className="bg-zinc-50/50 dark:bg-zinc-800/30 border-t border-zinc-100 dark:border-zinc-800 p-5 animate-fade-in">
                  <h4 className="text-sm font-bold text-zinc-600 dark:text-zinc-300 mb-3 flex items-center gap-2">
                    <Package size={16} /> รายการสินค้า
                  </h4>
                  <div className="grid gap-2">
                    {order.items?.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center bg-white dark:bg-zinc-800 p-3 rounded-xl border border-zinc-200 dark:border-zinc-700"
                      >
                        <span className="font-medium text-zinc-700 dark:text-zinc-200">
                          {item.product_name}
                        </span>
                        <div className="text-sm text-zinc-500 dark:text-zinc-400">
                          <span className="font-bold text-indigo-600 dark:text-indigo-400">
                            {item.quantity}
                          </span>{' '}
                          x ฿{item.price.toLocaleString()}
                        </div>
                      </div>
                    ))}
                    {(!order.items || order.items.length === 0) && (
                      <div className="text-sm text-zinc-400 dark:text-zinc-500">
                        ไม่มีข้อมูลสินค้าในบิลนี้
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}