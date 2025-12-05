import { LogOut, X, Moon, Sun } from 'lucide-react'; 
import { useTheme } from '../contexts/ThemeContext'; 

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  menuItems: { id: string; label: string; icon: any }[];
  userRole: string;
  username: string;
  onLogout: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ activeTab, setActiveTab, menuItems, userRole, username, onLogout, isOpen, onClose }: SidebarProps) {
  const { theme, toggleTheme } = useTheme(); 

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-zinc-900/80 z-30 md:hidden backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-40 w-72 h-full flex flex-col font-sans shadow-[4px_0_24px_rgba(0,0,0,0.02)] transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0 md:static md:shadow-none
        
        /* ✅ เปลี่ยนพื้นหลังเป็นสีดำสนิท (bg-black) และเส้นขอบเป็น zinc (เทาไม่ติดฟ้า) */
        bg-white border-r border-zinc-100 dark:bg-black dark:border-zinc-800 text-zinc-800 dark:text-zinc-200
      `}>
        
        {/* Header */}
        <div className="p-6 pb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl overflow-hidden shadow-lg shadow-indigo-200/50 border-2 border-white ring-2 ring-indigo-50 dark:ring-zinc-800 dark:border-zinc-700">
              <img src={"https://img.shop9bath.online/og-logo.jfif"} alt="Shop9Bath Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="text-[15px] text-black dark:text-white font-bold uppercase tracking-widest mt-0.5">Shop9Bath</p>
              <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-widest mt-0.5">Enterprise</p>
            </div>
          </div>
          <button onClick={onClose} className="md:hidden p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800">
            <X size={24} />
          </button>
        </div>

        {/* Menu */}
        <div className="flex-1 overflow-y-auto px-4 space-y-1">
          <p className="px-4 py-2 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Main Menu</p>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl transition-all duration-200 group relative ${
                  isActive 
                    ? 'bg-indigo-50 text-indigo-700 dark:bg-zinc-800 dark:text-white font-bold shadow-sm' /* ✅ Active State: พื้นหลังเทาเข้ม ตัวหนังสือขาว */
                    : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 hover:text-zinc-800 dark:hover:text-zinc-200 font-medium'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={20} className={`transition-colors ${isActive ? 'text-indigo-600 dark:text-white' : 'text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300'}`} />
                  <span>{item.label}</span>
                </div>
                {isActive && <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-white" />}
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 space-y-3">
          
          {/* Theme Toggle */}
          <button 
            onClick={toggleTheme}
            className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2 text-sm font-bold">
              {theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
              <span>{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
            </div>
            <div className={`w-8 h-4 rounded-full relative transition-colors ${theme === 'dark' ? 'bg-indigo-500' : 'bg-zinc-300'}`}>
              <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${theme === 'dark' ? 'left-4.5' : 'left-0.5'}`} />
            </div>
          </button>

          {/* Profile */}
          <div className="bg-zinc-50 dark:bg-zinc-900 rounded-2xl p-4 border border-zinc-200 dark:border-zinc-800 group hover:border-indigo-100 dark:hover:border-zinc-700 transition-colors">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md min-w-10 ${
                userRole === 'director' ? 'bg-linear-to-br from-purple-500 to-pink-600' : 
                userRole === 'manager' ? 'bg-linear-to-br from-indigo-500 to-blue-600' : 
                'bg-linear-to-br from-zinc-400 to-zinc-500'
              }`}>
                {username.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-zinc-700 dark:text-zinc-200 truncate">{username}</p>
                <p className="text-xs text-zinc-400 dark:text-zinc-500 capitalize truncate">{userRole}</p>
              </div>
            </div>
            <button 
              onClick={onLogout}
              className="w-full flex justify-center items-center gap-2 py-2 text-xs font-bold text-zinc-500 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-white dark:hover:bg-zinc-800 rounded-lg transition-all border border-transparent hover:border-red-100 dark:hover:border-red-900/30 hover:shadow-sm"
            >
              <LogOut size={14} /> Sign Out
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}