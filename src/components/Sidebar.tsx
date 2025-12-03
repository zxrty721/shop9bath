import { LogOut, X } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  menuItems: { id: string; label: string; icon: any }[];
  userRole: string;
  username: string;
  onLogout: () => void;
  isOpen: boolean;      // ✅ รับสถานะเปิด/ปิด
  onClose: () => void;  // ✅ รับฟังก์ชันปิด
}

export default function Sidebar({ activeTab, setActiveTab, menuItems, userRole, username, onLogout, isOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* Overlay (Backdrop) สำหรับมือถือ */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-30 md:hidden backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-72 bg-white border-r border-slate-100 h-full flex flex-col font-sans shadow-[4px_0_24px_rgba(0,0,0,0.02)] transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0 md:static md:shadow-none
      `}>
        
        {/* Brand & Mobile Close Button */}
        <div className="p-6 pb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-linear-to-tr from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-200 cursor-default">
              9
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">Shop9Bath</h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Enterprise</p>
            </div>
          </div>
          {/* ปุ่มปิดแสดงเฉพาะมือถือ */}
          <button onClick={onClose} className="md:hidden p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50">
            <X size={24} />
          </button>
        </div>

        {/* Menu */}
        <div className="flex-1 overflow-y-auto px-4 space-y-1">
          <p className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Main Menu</p>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  onClose(); // ✅ เลือกเมนูแล้วปิด Sidebar (บนมือถือ)
                }}
                className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl transition-all duration-200 group relative ${
                  isActive 
                    ? 'bg-indigo-50 text-indigo-700 font-bold shadow-sm' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800 font-medium'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={20} className={`transition-colors ${isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                  <span>{item.label}</span>
                </div>
                {isActive && <div className="w-1.5 h-1.5 rounded-full bg-indigo-600" />}
              </button>
            );
          })}
        </div>

        {/* Footer Profile */}
        <div className="p-4 border-t border-slate-100">
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 group hover:border-indigo-100 transition-colors">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md min-w-10 ${
                userRole === 'director' ? 'bg-linear-to-br from-purple-500 to-pink-600' : 
                userRole === 'manager' ? 'bg-linear-to-br from-indigo-500 to-blue-600' : 
                'bg-linear-to-br from-slate-400 to-slate-500'
              }`}>
                {username.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-700 truncate">{username}</p>
                <p className="text-xs text-slate-400 capitalize truncate">{userRole}</p>
              </div>
            </div>
            <button 
              onClick={onLogout}
              className="w-full flex justify-center items-center gap-2 py-2 text-xs font-bold text-slate-500 hover:text-red-600 hover:bg-white rounded-lg transition-all border border-transparent hover:border-red-100 hover:shadow-sm"
            >
              <LogOut size={14} /> Sign Out
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}