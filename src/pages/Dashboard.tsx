import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import Sidebar from '../components/Sidebar';

import Overview from '../components/views/Overview';
import PointOfSale from '../components/views/PointOfSale';
import ProductManager from '../components/views/ProductManager';
import UserManager from '../components/views/UserManager';
import TransactionHistory from '../components/views/TransactionHistory';

import { LayoutDashboard, Package, Users, ShieldAlert, ShoppingCart, FileText, Menu } from 'lucide-react';

type MenuKey = 'overview' | 'pos' | 'history' | 'products' | 'users';
type UserRole = 'director' | 'manager' | 'staff';

interface MenuConfig {
  label: string;
  icon: any;
  component: React.ReactElement;
  allowedRoles: UserRole[];
}

type MenuMap = Record<MenuKey, MenuConfig>;

export default function Dashboard() {
  const navigate = useNavigate();
  const userRole = (localStorage.getItem('role') || 'staff') as UserRole;
  const username = localStorage.getItem('username') || 'User';

  const [activeTab, setActiveTab] = useState<MenuKey>('overview');
  const [globalLoading, setGlobalLoading] = useState(true);
  
  // ✅ State สำหรับเปิด/ปิด Sidebar บนมือถือ
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const [globalData, setGlobalData] = useState({
    stats: {
      total_sales: 0, today_sales: 0, monthly_sales: 0, yearly_sales: 0,
      total_orders: 0, product_count: 0, low_stock_count: 0, user_count: 0
    },
    orders: [] as any[]
  });

  const fetchGlobalData = useCallback(async () => {
    try {
      const [statsRes, ordersRes] = await Promise.allSettled([
        api.get('/dashboard'),
        api.get('/orders')
      ]);

      if (statsRes.status === 'fulfilled') {
        setGlobalData(prev => ({ ...prev, stats: statsRes.value.data }));
      }
      if (ordersRes.status === 'fulfilled') {
        setGlobalData(prev => ({ ...prev, orders: ordersRes.value.data }));
      }
    } catch (err) {
      console.error("Global fetch error:", err);
    } finally {
      setGlobalLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!localStorage.getItem('role')) navigate('/');
    else fetchGlobalData();
  }, [navigate, fetchGlobalData]);

  const handleLogout = async () => {
    try { await api.post('/logout'); } catch {}
    localStorage.clear();
    navigate('/');
  };

  const MENU_MAP: MenuMap = {
    overview: { label: 'ภาพรวมระบบ', icon: LayoutDashboard, component: <Overview stats={globalData.stats} loading={globalLoading} />, allowedRoles: ['director', 'manager', 'staff'] },
    pos: { label: 'ขายสินค้า (POS)', icon: ShoppingCart, component: <PointOfSale onSaleComplete={fetchGlobalData} />, allowedRoles: ['director', 'manager', 'staff'] },
    history: { label: 'ประวัติการขาย', icon: FileText, component: <TransactionHistory orders={globalData.orders} loading={globalLoading} />, allowedRoles: ['director', 'manager', 'staff'] },
    products: { label: 'จัดการคลังสินค้า', icon: Package, component: <ProductManager onDataChange={fetchGlobalData} />, allowedRoles: ['director', 'manager', 'staff'] },
    users: { label: 'จัดการพนักงาน', icon: Users, component: <UserManager />, allowedRoles: ['director', 'manager'] }
  };

  const sidebarItems = useMemo(() => {
    return Object.entries(MENU_MAP)
      .filter(([_, config]) => config.allowedRoles.includes(userRole))
      .map(([key, config]) => ({ id: key as MenuKey, label: config.label, icon: config.icon }));
  }, [userRole]);

  const renderContent = () => {
    const currentMenu = MENU_MAP[activeTab];
    if (!currentMenu || !currentMenu.allowedRoles.includes(userRole)) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-slate-400">
          <ShieldAlert size={64} className="mb-4 text-red-400 opacity-50" />
          <h2 className="text-xl font-bold">Access Denied</h2>
        </div>
      );
    }
    return currentMenu.component;
  };

  return (
    <div className="flex h-screen w-screen bg-[#f8fafc] overflow-hidden font-prompt">
      
      {/* ✅ Sidebar (ส่ง props isOpen, onClose ไปด้วย) */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        menuItems={sidebarItems} 
        userRole={userRole} 
        username={username} 
        onLogout={handleLogout}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Layout */}
      <div className="flex-1 flex flex-col h-full w-full relative">
        
        {/* ✅ Mobile Header (แสดงเฉพาะจอมือถือ) */}
        <header className="md:hidden h-16 bg-white border-b border-slate-100 flex items-center justify-between px-4 shrink-0 z-20 shadow-sm">
           <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-linear-to-tr from-indigo-600 to-violet-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">9</div>
             <span className="font-bold text-slate-800">Shop9Bath</span>
           </div>
           <button 
             onClick={() => setIsSidebarOpen(true)}
             className="p-2 text-slate-500 hover:bg-slate-50 rounded-lg transition-colors"
           >
             <Menu size={24} />
           </button>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto bg-slate-50/50 p-4 md:p-10 pb-20 scroll-smooth">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}