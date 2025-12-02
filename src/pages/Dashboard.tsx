import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import Sidebar from '../components/Sidebar';

// Import Components
import SalesSummary from '../components/SalesSummary';
import ProductManager from '../components/ProductManager';
import UserManager from '../components/UserManager';

// Import Icons
import { LayoutDashboard, Package, Users, ShieldAlert } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  
  // 1. ดึงข้อมูล User & Role
  const userRole = localStorage.getItem('role') || 'staff';
  const username = localStorage.getItem('username') || 'User';

  // MENU CONFIGURATION
  const MENU_MAP = {
    overview: {
      label: 'ภาพรวมระบบ',
      icon: LayoutDashboard,
      component: <SalesSummary />,
      allowedRoles: ['admin', 'staff'] 
    },
    products: {
      label: 'จัดการสินค้า',
      icon: Package,
      component: <ProductManager />,
      allowedRoles: ['admin', 'staff']
    },
    users: {
      label: 'จัดการพนักงาน',
      icon: Users,
      component: <UserManager />,
      allowedRoles: ['admin']
    }
  };

  const [activeTab, setActiveTab] = useState<keyof typeof MENU_MAP>('overview');

  useEffect(() => {
    if (!localStorage.getItem('role')) navigate('/');
  }, [navigate]);

  const handleLogout = async () => {
    try { await api.post('/logout'); } catch {}
    localStorage.clear();
    navigate('/');
  };

  const sidebarItems = useMemo(() => {
    return Object.entries(MENU_MAP)
      .filter(([_, config]) => config.allowedRoles.includes(userRole))
      .map(([key, config]) => ({
        id: key,
        label: config.label,
        icon: config.icon
      }));
  }, [userRole]);

  const renderContent = () => {
    const currentMenu = MENU_MAP[activeTab as keyof typeof MENU_MAP];
    if (!currentMenu || !currentMenu.allowedRoles.includes(userRole)) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-slate-400">
          <ShieldAlert size={64} className="mb-4 text-red-400 opacity-50" />
          <h2 className="text-xl font-bold text-slate-600">Access Denied</h2>
          <p>คุณไม่มีสิทธิ์เข้าถึงหน้านี้</p>
        </div>
      );
    }
    return currentMenu.component;
  };

  return (
    // 🟢 Container หลัก: เต็มจอ (h-screen) และห้าม Scroll ที่ Body (overflow-hidden)
    <div className="flex h-screen w-screen bg-[#f8fafc] overflow-hidden">
      
      {/* 🟢 Sidebar Container: เป็น Flex Item ด้านซ้าย */}
      <div className="hidden md:block w-72 h-full flex-shrink-0">
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          menuItems={sidebarItems}
          userRole={userRole} 
          username={username} 
          onLogout={handleLogout} 
        />
      </div>

      {/* 🟢 Main Content: กินพื้นที่ที่เหลือทั้งหมด (flex-1) และ Scroll ได้เฉพาะตัวเอง */}
      <main className="flex-1 h-full overflow-y-auto p-4 md:p-8 relative">
        <div className="max-w-7xl mx-auto animate-fade-in pb-10">
          {renderContent()}
        </div>
      </main>

    </div>
  );
}