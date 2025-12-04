import { useState, useMemo } from 'react';
import {
  FileText,
  Calendar,
  DollarSign,
  Package,
  ChevronDown,
  Search,
} from 'lucide-react';
import { type Order } from '../../types';

interface TransactionHistoryProps {
  orders: Order[];
  loading: boolean;
}

export default function TransactionHistory({
  orders,
  loading,
}: TransactionHistoryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  // ✅ Memoize: กรองข้อมูลเฉพาะเมื่อ orders หรือ searchTerm เปลี่ยน
  const filteredOrders = useMemo(
    () =>
      orders.filter((o) => o.id.toString().includes(searchTerm)),
    [orders, searchTerm],
  );

  if (loading)
    return (
      <div className="p-10 text-center text-slate-400 animate-pulse">
        กำลังโหลดข้อมูล...
      </div>
    );

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <FileText className="text-indigo-600" /> ประวัติการขาย
          </h2>
          <p className="text-slate-500 text-sm mt-1">รายการบิลย้อนหลัง</p>
        </div>
        <div className="relative w-full md:w-64">
          <Search
            className="absolute left-3 top-2.5 text-slate-400"
            size={18}
          />
          <input
            type="text"
            placeholder="ค้นหาเลขที่บิล..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm text-sm transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200">
            <FileText
              size={48}
              className="mx-auto text-slate-300 mb-2"
            />
            <p className="text-slate-400">ไม่พบประวัติการขาย</p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden transition-all hover:shadow-md hover:border-indigo-100"
            >
              <div
                onClick={() => toggleExpand(order.id)}
                className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer bg-white hover:bg-slate-50/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white transition-colors ${
                      expandedId === order.id
                        ? 'bg-indigo-600 shadow-md scale-110'
                        : 'bg-slate-400'
                    }`}
                  >
                    #{order.id}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
                      <Calendar size={14} />{' '}
                      {order.created_at
                        ? new Date(
                            order.created_at,
                          ).toLocaleString('th-TH')
                        : '-'}
                    </div>
                    <div className="font-bold text-slate-800">
                      Bill ID: {order.id}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-6 flex-1">
                  <div className="text-right">
                    <p className="text-xs text-slate-400 uppercase font-bold">
                      ยอดสุทธิ
                    </p>
                    <p className="text-xl font-bold text-emerald-600 flex items-center gap-1 justify-end">
                      <DollarSign size={16} />{' '}
                      {order.total_amount.toLocaleString()}
                    </p>
                  </div>
                  <div
                    className="text-slate-400 transition-transform duration-300"
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
                <div className="bg-slate-50/50 border-t border-slate-100 p-5 animate-fade-in">
                  <h4 className="text-sm font-bold text-slate-600 mb-3 flex items-center gap-2">
                    <Package size={16} /> รายการสินค้า
                  </h4>
                  <div className="grid gap-2">
                    {order.items?.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-200"
                      >
                        <span className="font-medium text-slate-700">
                          {item.product_name}
                        </span>
                        <div className="text-sm text-slate-500">
                          <span className="font-bold text-indigo-600">
                            {item.quantity}
                          </span>{' '}
                          x ฿{item.price.toLocaleString()}
                        </div>
                      </div>
                    ))}
                    {(!order.items || order.items.length === 0) && (
                      <div className="text-sm text-slate-400">
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
