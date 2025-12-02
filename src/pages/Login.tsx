import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { User, Lock, ArrowRight, AlertCircle } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); // เคลียร์ Error เก่าก่อน

    try {
      const res = await api.post('/login', { username, password });
      
      // ถ้าสำเร็จ
      localStorage.setItem('role', res.data.role);
      localStorage.setItem('username', res.data.username);
      navigate('/dashboard');

    } catch (err: any) {
      // ✅ จุดที่แก้ไข: ดึงข้อความจาก Backend มาแสดง
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        // กรณี Server ดับ หรือ Error อื่นๆ ที่ไม่มี response
        setError('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f0f4f8] p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-blue-600 to-blue-500 rounded-b-[3rem] shadow-xl z-0"></div>

      <div className="bg-white/90 backdrop-blur-xl p-8 rounded-3xl shadow-2xl w-full max-w-[400px] z-10 border border-white/50 animate-fade-in">
        <div className="text-center mb-8 mt-2">
          <img src="/og-9bath.svg" className="w-16 h-16 mx-auto mb-4 drop-shadow-md hover:scale-110 transition-transform duration-300" alt="Logo" />
          <h1 className="text-2xl font-bold text-slate-800">ยินดีต้อนรับกลับ</h1>
          <p className="text-slate-500 text-sm mt-1">เข้าสู่ระบบเพื่อจัดการร้านค้าของคุณ</p>
        </div>

        {/* ✅ กล่องแสดง Error แบบใหม่ */}
        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm text-center mb-6 font-medium flex items-center justify-center gap-2 animate-pulse">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="relative group">
            <User className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="ชื่อผู้ใช้" 
              className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all font-medium text-slate-700" 
              value={username} 
              onChange={e=>setUsername(e.target.value)} 
              required 
            />
          </div>
          <div className="relative group">
            <Lock className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
            <input 
              type="password" 
              placeholder="รหัสผ่าน" 
              className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all font-medium text-slate-700" 
              value={password} 
              onChange={e=>setPassword(e.target.value)} 
              required 
            />
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200 flex items-center justify-center gap-2 group transform active:scale-[0.98]">
            เข้าสู่ระบบ <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform"/>
          </button>
        </form>
        
        <div className="mt-8 text-center">
          <p className="text-slate-400 text-sm">ยังไม่มีบัญชีใช่ไหม?</p>
          <Link to="/register" className="text-blue-600 font-bold hover:underline text-sm">สมัครสมาชิกใหม่ที่นี่</Link>
        </div>
      </div>
    </div>
  );
}