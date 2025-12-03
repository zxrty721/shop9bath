import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api'; 
import { User, Lock, ArrowRight, AlertCircle } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); // 🛑 ห้ามรีเฟรชหน้า
    setError('');
    setIsSubmitting(true);

    try {
      const res = await api.post('/login', { username, password });
      
      // Login ผ่าน
      localStorage.setItem('role', res.data.role);
      localStorage.setItem('username', res.data.username);
      localStorage.setItem('user_id', res.data.user_id);
      
      navigate('/dashboard'); 

    } catch (err: any) {
      // Login ไม่ผ่าน
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
      }
      // ❌ ไม่ต้องสั่งล้าง Password ข้อมูลจะคาอยู่ให้แก้ต่อได้เลย
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 font-prompt p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-indigo-600/20 rounded-full animate-pulse"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-blue-600/20 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>

      <div className="bg-white/95 backdrop-blur-sm p-8 rounded-3xl shadow-2xl w-full max-w-[400px] z-10 border border-white/50 animate-fade-in relative">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-800">NineCore</h1>
          <p className="text-slate-500 text-xs mt-1 uppercase">Enterprise Login</p>
        </div>

        {/* Error Box */}
        {error && (
           <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm text-center mb-6 flex items-center justify-center gap-2 animate-pulse">
            <AlertCircle size={18} /> {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="relative group">
            <User className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Username" 
              className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all" 
              value={username} 
              onChange={e => setUsername(e.target.value)} 
            />
          </div>
          <div className="relative group">
            <Lock className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
            <input 
              type="password" 
              placeholder="Password" 
              className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
            />
          </div>
          
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold hover:bg-black transition shadow-lg flex items-center justify-center gap-2 active:scale-95 duration-100"
          >
            {isSubmitting ? '...' : <><span className="mr-1">เข้าสู่ระบบ</span> <ArrowRight size={18} /></>}
          </button>
        </form>
        
        <div className="mt-8 text-center border-t border-slate-100 pt-6">
          <p className="text-slate-400 text-sm">ยังไม่มีบัญชี?</p>
          <Link to="/register" className="text-indigo-600 font-bold hover:underline text-sm ml-1">สมัครสมาชิกใหม่</Link>
        </div>
      </div>
    </div>
  );
}