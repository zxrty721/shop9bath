import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import Sidebar from "../components/Sidebar";

import Overview from "../components/views/Overview";
import PointOfSale from "../components/views/PointOfSale";
import ProductManager from "../components/views/ProductManager";
import UserManager from "../components/views/UserManager";
import TransactionHistory from "../components/views/TransactionHistory";

import {
    LayoutDashboard,
    Package,
    Users,
    ShieldAlert,
    ShoppingCart,
    FileText,
    Menu,
    type LucideIcon, // ✅ Import Type
} from "lucide-react";

import type { DashboardStats, Order, OrdersResponse, Product } from "../types";

type MenuKey = "overview" | "pos" | "history" | "products" | "users";
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
    const userRole = (localStorage.getItem("role") || "staff") as UserRole;
    const username = localStorage.getItem("username") || "User";

    const [activeTab, setActiveTab] = useState<MenuKey>("overview");
    const [globalLoading, setGlobalLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // ✅ ลบ viewMode และ currentDate ออก เพราะไม่ได้ใช้แล้ว (ย้าย logic ไปคำนวณใน Overview)

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
            product_count: 0,
            low_stock_count: 0,
            user_count: 0,
        },
        orders: [],
        products: [],
    });

    const fetchGlobalData = useCallback(async () => {
        setGlobalLoading(true);
        try {
            // ✅ ใช้ new Date() โดยตรงแทน State
            const today = new Date();
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, "0");
            const day = String(today.getDate()).padStart(2, "0");
            const dateStr = `${year}-${month}-${day}`;

            const [statsRes, ordersRes, productsRes] = await Promise.allSettled(
                [
                    // Default mode="day" แค่เพื่อให้ API ไม่ Error
                    api.get<DashboardStats>("/dashboard", {
                        params: { date: dateStr, mode: "day" },
                    }),
                    api.get<OrdersResponse | Order[]>("/orders"),
                    api.get<Product[]>("/products"),
                ],
            );

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
    }, []); // ✅ ไม่มี dependency เพราะไม่ได้ใช้ state แล้ว

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

    const MENU_MAP: MenuMap = {
        overview: {
            label: "ภาพรวมระบบ",
            icon: LayoutDashboard,
            component: (
                <Overview
                    stats={globalData.stats}
                    orders={globalData.orders} // ✅ ส่ง orders ไปคำนวณ
                    loading={globalLoading}
                    totalProductCount={globalData.products.length}
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
    };

    const sidebarItems = Object.entries(MENU_MAP)
        .filter(([, config]) => config.allowedRoles.includes(userRole))
        .map(([key, config]) => ({
            id: key as MenuKey,
            label: config.label,
            icon: config.icon,
        }));

    const renderContent = () => {
        const currentMenu = MENU_MAP[activeTab];
        if (!currentMenu || !currentMenu.allowedRoles.includes(userRole)) {
            return (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-500">
                    <ShieldAlert
                        size={64}
                        className="mb-4 text-red-400 opacity-50"
                    />
                    <h2 className="text-xl font-bold">Access Denied</h2>
                </div>
            );
        }
        return currentMenu.component;
    };

    return (
        <div className="flex h-screen w-screen bg-[#f4f4f5] dark:bg-[#09090b] dark:text-zinc-200 overflow-hidden font-prompt transition-colors duration-300">
            <Sidebar
                activeTab={activeTab}
                setActiveTab={(tab) => setActiveTab(tab as MenuKey)}
                menuItems={sidebarItems}
                userRole={userRole}
                username={username}
                onLogout={handleLogout}
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />

            <div className="flex-1 flex flex-col h-full w-full relative">
                <header className="md:hidden h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 shrink-0 z-20 shadow-sm transition-colors duration-300">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl overflow-hidden shadow-lg shadow-indigo-200/50 border-2 border-white ring-2 ring-indigo-50 dark:ring-zinc-800 dark:border-zinc-700">
                            <img
                                src={
                                    "https://img.shop9bath.online/og-logo.jfif"
                                }
                                alt="Shop9Bath Logo"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <span className="font-bold text-slate-800 dark:text-white">
                            Shop9Bath
                        </span>
                    </div>
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                        <Menu size={24} />
                    </button>
                </header>

                <main className="flex-1 overflow-y-auto bg-zinc-50/50 dark:bg-[#09090b] p-4 md:p-10 pb-20 scroll-smooth transition-colors duration-300">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
}
