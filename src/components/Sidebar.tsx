import { LogOut } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  menuItems: { id: string; label: string; icon: any }[];
  userRole: string;
  username: string;
  onLogout: () => void;
}

export default function Sidebar({ activeTab, setActiveTab, menuItems, userRole, username, onLogout }: SidebarProps) {
  return (
    // ⚠️ ลบ fixed ออก เปลี่ยนเป็น h-full เพื่อให้ยืดเต็มความสูงของ Container แม่
    <aside className="w-72 bg-white border-r border-slate-100 h-full flex flex-col z-20 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
      {/* Logo Area */}
      <div className="p-8 pb-6 flex-shrink-0">
        <div className="flex items-center gap-3.5">
          <img src="/og-9bath.svg" alt="Logo" className="w-10 h-10 drop-shadow-sm hover:scale-105 transition-transform" />
          <div>
            <h1 className="text-lg font-bold text-slate-800 tracking-tight leading-none">Shop 9 Baht</h1>
            <p className="text-[11px] text-slate-400 mt-1 font-medium uppercase tracking-wide">Management System</p>
          </div>
        </div>
      </div>

      {/* Dynamic Navigation (Scrollable if needed) */}
      <div className="flex-1 overflow-y-auto px-4 py-2 custom-scrollbar">
        <nav className="space-y-1.5">
          <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Main Menu</p>
          
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium group text-sm ${
                  isActive 
                    ? 'bg-blue-50 text-blue-600 shadow-sm ring-1 ring-blue-100' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon size={18} className={`transition-colors flex-shrink-0 ${isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                {item.label}
              </button>
            )
          })}
        </nav>
      </div>

      {/* User Profile Footer (Fixed at bottom) */}
      <div className="p-4 m-4 bg-slate-50/80 rounded-2xl border border-slate-100 backdrop-blur-sm flex-shrink-0">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-blue-600 font-bold shadow-sm text-sm flex-shrink-0">
            {username.charAt(0).toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-bold text-slate-700 truncate">{username}</p>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider inline-block ${
              userRole === 'admin' ? 'bg-purple-100 text-purple-600' : 'bg-green-100 text-green-600'
            }`}>
              {userRole}
            </span>
          </div>
        </div>
        <button 
          onClick={onLogout}
          className="w-full flex justify-center items-center gap-2 py-2 text-xs font-semibold text-red-500 hover:bg-white hover:shadow-sm rounded-lg transition border border-transparent hover:border-red-100"
        >
          <LogOut size={14} /> ออกจากระบบ
        </button>
      </div>
    </aside>
  );
}