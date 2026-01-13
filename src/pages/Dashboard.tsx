import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import Sidebar from "../components/Sidebar";

// ✅ Import Views ทั้งหมด
import Overview from "../components/views/Overview";
import PointOfSale from "../components/views/PointOfSale";
import ProductManager from "../components/views/ProductManager";
import UserManager from "../components/views/UserManager";
import TransactionHistory from "../components/views/TransactionHistory";
import About from "../components/views/About"; // ✅ หน้าผู้จัดทำ

// ✅ Import Icons
import {
  LayoutDashboard,
  Package,
  Users,
  ShieldAlert,
  ShoppingCart,
  FileText,
  Menu,
  Info, // ไอคอนสำหรับหน้า About
  type LucideIcon,
} from "lucide-react";

// ✅ Import Types
import type { DashboardStats, Order, OrdersResponse, Product } from "../types";

// ✅ Type Definitions
type MenuKey = "overview" | "pos" | "history" | "products" | "users" | "about";
type UserRole = "director" | "manager" | "staff";

interface MenuConfig {
  label: string;
  icon: LucideIcon;
  component: React.ReactElement;
  allowedRoles: UserRole[];
}

type MenuMap = Record<MenuKey, MenuConfig>;

export default function Dashboard() {
  const navigate = useNavigate();

  // ดึง Role และ Username จาก LocalStorage
  const userRole = (localStorage.getItem("role") || "staff") as UserRole;
  const username = localStorage.getItem("username") || "User";

  // State ควบคุม UI
  const [activeTab, setActiveTab] = useState<MenuKey>("overview");
  const [globalLoading, setGlobalLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // ✅ State สำหรับ Date Filter (เริ่มที่วันปัจจุบัน)
  const today = new Date();
  const [selectedDay, setSelectedDay] = useState(today.getDate());
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());

  // State เก็บข้อมูล Global
  const [globalData, setGlobalData] = useState<{
    stats: DashboardStats;
    orders: Order[];
    products: Product[];
  }>({
    stats: {
      total_sales: 0,
      today_sales: 0,
      monthly_sales: 0,
      yearly_sales: 0,
      total_orders: 0,
      // product_count: 0,  <-- ลบบรรทัดนี้ออก
      low_stock_count: 0,
      user_count: 0,
    },
    orders: [],
    products: [],
  });

  // ✅ ฟังก์ชันดึงข้อมูล (เรียกใหม่เมื่อเปลี่ยนวันที่ หรือมีการอัปเดตข้อมูล)
  const fetchGlobalData = useCallback(async () => {
    setGlobalLoading(true);
    try {
      // ส่ง Params วัน/เดือน/ปี ไปให้ Backend คำนวณยอด
      const params = {
        day: selectedDay,
        month: selectedMonth,
        year: selectedYear,
      };

      const [statsRes, ordersRes, productsRes] = await Promise.allSettled([
        api.get<DashboardStats>("/dashboard", { params }),
        api.get<OrdersResponse | Order[]>("/orders", { params }), // Orders ก็ Filter ตามวันที่เลือก
        api.get<Product[]>("/products"),
      ]);

      setGlobalData((prev) => {
        const newData = { ...prev };

        if (statsRes.status === "fulfilled") {
          newData.stats = statsRes.value.data;
        }

        if (ordersRes.status === "fulfilled") {
          const data = ordersRes.value.data;
          newData.orders = Array.isArray(data)
            ? (data as Order[])
            : ((data as OrdersResponse).orders ?? []);
        }

        if (productsRes.status === "fulfilled") {
          newData.products = productsRes.value.data;
        }

        return newData;
      });
    } catch (err) {
      console.error("Global fetch error:", err);
    } finally {
      setGlobalLoading(false);
    }
  }, [selectedDay, selectedMonth, selectedYear]); // Re-fetch เมื่อวันที่เปลี่ยน

  // Effect ตรวจสอบ Login และดึงข้อมูลครั้งแรก
  useEffect(() => {
    if (!localStorage.getItem("role")) navigate("/");
    else fetchGlobalData();
  }, [navigate, fetchGlobalData]);

  const handleLogout = async () => {
    try {
      await api.post("/logout");
    } catch {
      /* ignore */
    }
    localStorage.clear();
    navigate("/");
  };

  // ✅ Config เมนูทั้งหมด
  const MENU_MAP: MenuMap = {
    overview: {
      label: "ภาพรวมระบบ",
      icon: LayoutDashboard,
      component: (
        <Overview
          stats={globalData.stats}
          orders={globalData.orders}
          loading={globalLoading}
          totalProductCount={globalData.products.length}
          // ส่ง Props สำหรับ Filter วันที่
          selectedDay={selectedDay}
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          onDateChange={(d, m, y) => {
            setSelectedDay(d);
            setSelectedMonth(m);
            setSelectedYear(y);
          }}
        />
      ),
      allowedRoles: ["director", "manager", "staff"],
    },
    pos: {
      label: "ขายสินค้า (POS)",
      icon: ShoppingCart,
      component: <PointOfSale onDataChange={fetchGlobalData} />,
      allowedRoles: ["director", "manager", "staff"],
    },
    history: {
      label: "ประวัติการขาย",
      icon: FileText,
      component: (
        <TransactionHistory
          orders={globalData.orders}
          loading={globalLoading}
        />
      ),
      allowedRoles: ["director", "manager", "staff"],
    },
    products: {
      label: "จัดการคลังสินค้า",
      icon: Package,
      component: <ProductManager onDataChange={fetchGlobalData} />,
      allowedRoles: ["director", "manager", "staff"],
    },
    users: {
      label: "จัดการพนักงาน",
      icon: Users,
      component: <UserManager />,
      allowedRoles: ["director", "manager"],
    },
    about: {
      label: "ผู้จัดทำ",
      icon: Info,
      component: <About />,
      allowedRoles: ["director", "manager", "staff"],
    },
  };

  // สร้างรายการเมนูสำหรับ Sidebar
  const sidebarItems = Object.entries(MENU_MAP)
    .filter(([, config]) => config.allowedRoles.includes(userRole))
    .map(([key, config]) => ({
      id: key as MenuKey,
      label: config.label,
      icon: config.icon,
    }));

  // ฟังก์ชัน Render เนื้อหาตาม Tab ที่เลือก
  const renderContent = () => {
    const currentMenu = MENU_MAP[activeTab];
    if (!currentMenu || !currentMenu.allowedRoles.includes(userRole)) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-500">
          <ShieldAlert size={64} className="mb-4 text-red-400 opacity-50" />
          <h2 className="text-xl font-bold">Access Denied</h2>
        </div>
      );
    }
    return currentMenu.component;
  };

  return (
    <div className="flex h-screen w-screen bg-[#f4f4f5] dark:bg-[#09090b] dark:text-zinc-200 overflow-hidden font-prompt transition-colors duration-300">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab as MenuKey);
          setIsSidebarOpen(false); // ปิด Sidebar ใน Mobile เมื่อเลือกเมนู
        }}
        menuItems={sidebarItems}
        userRole={userRole}
        username={username}
        onLogout={handleLogout}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full w-full relative">
        {/* Mobile Header */}
        <header className="md:hidden h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 shrink-0 z-20 shadow-sm transition-colors duration-300">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg overflow-hidden bg-indigo-500">
              {/* ใส่ Logo จริงตรงนี้ได้ */}
              <img
                src="https://img.shop9bath.online/og-logo.jfif"
                className="w-full h-full object-cover"
                alt="Logo"
                onError={(e) => (e.currentTarget.style.display = "none")}
              />
            </div>
            <span className="font-bold text-slate-800 dark:text-white">
              Shop9Bath
            </span>
          </div>
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
          >
            <Menu size={24} />
          </button>
        </header>

        {/* Content Render */}
        <main className="flex-1 overflow-y-auto bg-zinc-50/50 dark:bg-[#09090b] p-4 md:p-10 pb-20 scroll-smooth transition-colors duration-300">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
