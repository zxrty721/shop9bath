import { useEffect, useState } from 'react';
import api from '../api';
import { type User } from '../types';
import { 
  Shield,  UserPlus, 
  Ban, PauseCircle, CheckCircle2, X, Trash2, 
} from 'lucide-react';

export default function UserManager() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, _setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState({ username: '', password: '', fullname: '', role: 'staff' });

  // 1. ดึงข้อมูลจริงจาก Backend
  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data);
    } catch (err) { console.error("Access Denied"); } 
    finally { setLoading(false); }
  };

  // 2. ยิง API เปลี่ยนสถานะจริงๆ
  const handleStatusChange = async (id: number, newStatus: string, confirmMsg: string) => {
    if (!confirm(confirmMsg)) return;
    try {
      // ยิงไปที่ Route ที่เราเพิ่งสร้าง
      await api.patch(`/users/${id}/status`, { status: newStatus });
      
      // อัปเดตหน้าจอทันที
      setUsers(prev => prev.map(u => u.ID === id ? { ...u, Status: newStatus as any } : u));
    } catch (err) {
      alert("เกิดข้อผิดพลาด: กรุณาตรวจสอบว่า Backend รันอยู่และรองรับ PATCH แล้ว");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("⚠️ ยืนยันการลบข้อมูลถาวร?")) return;
    try {
      await api.delete(`/users/${id}`);
      setUsers(prev => prev.filter(u => u.ID !== id));
    } catch { alert("ลบไม่สำเร็จ"); }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/register', newUser);
      setShowAddModal(false);
      setNewUser({ username: '', password: '', fullname: '', role: 'staff' });
      fetchUsers();
      alert("✅ สร้างบัญชีสำเร็จ");
    } catch { alert("❌ สร้างไม่สำเร็จ"); }
  };

  const filteredUsers = users.filter(u => 
    u.Username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.Fullname.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="p-12 text-center text-slate-400">กำลังโหลดข้อมูล...</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Shield className="text-purple-600" /> จัดการพนักงาน
          </h2>
          <p className="text-slate-500 text-sm mt-1">ควบคุมสิทธิ์และสถานะบัญชี</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="bg-blue-600 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 hover:bg-blue-700 shadow-lg font-bold text-sm">
          <UserPlus size={18} /> เพิ่มพนักงาน
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="p-5 text-xs font-bold text-slate-500 uppercase pl-6">ชื่อผู้ใช้</th>
              <th className="p-5 text-xs font-bold text-slate-500 uppercase">ตำแหน่ง</th>
              <th className="p-5 text-xs font-bold text-slate-500 uppercase">สถานะ</th>
              <th className="p-5 text-xs font-bold text-slate-500 uppercase text-right pr-6">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredUsers.map((u) => {
              const status = u.Status || 'active'; // ถ้าไม่มีสถานะ ให้ถือว่า Active
              return (
                <tr key={u.ID} className={`transition-colors ${status === 'fired' ? 'bg-red-50/50 grayscale opacity-80' : 'hover:bg-slate-50'}`}>
                  <td className="p-5 pl-6">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm text-white ${u.Role === 'admin' ? 'bg-purple-500' : 'bg-blue-500'}`}>
                        {u.Username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-slate-700">{u.Fullname}</div>
                        <div className="text-xs text-slate-400">@{u.Username}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-5">
                    <span className={`px-2 py-1 rounded text-xs font-bold border ${u.Role === 'admin' ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-slate-50 text-slate-700 border-slate-200'}`}>
                      {u.Role.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-5">
                    {status === 'active' && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200"><span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"/> Active</span>}
                    {status === 'suspended' && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-700 border border-orange-200"><PauseCircle size={14}/> พักงาน</span>}
                    {status === 'fired' && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200"><Ban size={14}/> พ้นสภาพ</span>}
                  </td>
                  <td className="p-5 text-right pr-6">
                    <div className="flex justify-end gap-2">
                      {status !== 'active' ? (
                        <button onClick={() => handleStatusChange(u.ID, 'active', 'ยืนยันการคืนสภาพ?')} className="flex items-center gap-1 px-3 py-1.5 border hover:bg-green-50 hover:text-green-600 hover:border-green-200 rounded-lg text-xs font-bold transition">
                          <CheckCircle2 size={14} /> คืนสภาพ
                        </button>
                      ) : (
                        <>
                          <button onClick={() => handleStatusChange(u.ID, 'suspended', 'พักงานชั่วคราว?')} className="p-2 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg"><PauseCircle size={18} /></button>
                          <button onClick={() => handleStatusChange(u.ID, 'fired', 'ไล่ออกถาวร?')} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Ban size={18} /></button>
                        </>
                      )}
                      <div className="w-px h-5 bg-slate-200 mx-1"></div>
                      <button onClick={() => handleDelete(u.ID)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-scale-in">
            <div className="flex justify-between mb-4"><h3 className="font-bold flex gap-2"><UserPlus className="text-blue-600"/> เพิ่มพนักงาน</h3><button onClick={()=>setShowAddModal(false)}><X/></button></div>
            <form onSubmit={handleAddUser} className="space-y-3">
              <input required placeholder="ชื่อ-นามสกุล" className="input-field" onChange={e=>setNewUser({...newUser, fullname: e.target.value})}/>
              <input required placeholder="Username" className="input-field" onChange={e=>setNewUser({...newUser, username: e.target.value})}/>
              <input required type="password" placeholder="Password" className="input-field" onChange={e=>setNewUser({...newUser, password: e.target.value})}/>
              <select className="input-field" onChange={e=>setNewUser({...newUser, role: e.target.value})}>
                <option value="staff">Staff</option><option value="admin">Admin</option>
              </select>
              <button className="w-full bg-blue-600 text-white p-2.5 rounded-xl font-bold mt-2 hover:bg-blue-700 shadow-lg">บันทึก</button>
            </form>
          </div>
        </div>
      )}
      <style>{`.input-field { @apply w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm; }`}</style>
    </div>
  );
}