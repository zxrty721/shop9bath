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
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const res = await api.post('/login', { username, password });
      
      localStorage.setItem('role', res.data.role);
      localStorage.setItem('username', res.data.username);
      localStorage.setItem('user_id', res.data.user_id);
      
      navigate('/dashboard'); 

    } catch (err: any) {
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    // ✅ พื้นหลัง: Light=Zinc-100 / Dark=Zinc-Gradient (ดำไล่เฉด)
    <div className="min-h-screen flex items-center justify-center bg-zinc-100 dark:bg-linear-to-br dark:from-zinc-900 dark:via-black dark:to-zinc-900 font-prompt p-4 relative overflow-hidden transition-colors duration-500">
      
      {/* Background Decor (Animation) */}
   <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-indigo-600/20 rounded-full animate-pulse"></div>
      <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-blue-600/20 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
    </div>


      {/* Card */}
      <div className="bg-white dark:bg-zinc-900/90 backdrop-blur-xl p-8 rounded-3xl shadow-2xl w-full max-w-[400px] z-10 border border-zinc-200 dark:border-zinc-800 animate-fade-in relative transition-colors duration-300">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">เข้าสู่ระบบ</h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-xs mt-1.5 uppercase tracking-widest font-semibold">Enterprise Login</p>
        </div>

        {error && (
           <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 px-4 py-3 rounded-xl text-sm text-center mb-6 flex items-center justify-center gap-2 animate-pulse">
            <AlertCircle size={18} /> {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="relative group">
            <User className="absolute left-4 top-3.5 text-zinc-400 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 transition-colors z-10" size={20} />
            <input 
              type="text" 
              placeholder="Username" 
              className="w-full pl-12 pr-4 py-3.5 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/30 dark:focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-zinc-900 dark:text-white placeholder:text-zinc-400 font-medium" 
              value={username} 
              onChange={e => setUsername(e.target.value)} 
            />
          </div>
          <div className="relative group">
            <Lock className="absolute left-4 top-3.5 text-zinc-400 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 transition-colors z-10" size={20} />
            <input 
              type="password" 
              placeholder="Password" 
              className="w-full pl-12 pr-4 py-3.5 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/30 dark:focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-zinc-900 dark:text-white placeholder:text-zinc-400 font-medium" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
            />
          </div>
          
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-zinc-900 hover:bg-black dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black py-3.5 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 active:scale-95 duration-100"
          >
            {isSubmitting ? 'กำลังตรวจสอบ...' : <><span className="mr-1">เข้าสู่ระบบ</span> <ArrowRight size={18} /></>}
          </button>
        </form>
        
        <div className="mt-8 text-center border-t border-zinc-100 dark:border-zinc-800 pt-6">
          <p className="text-zinc-400 text-sm">ยังไม่มีบัญชี?</p>
          <Link to="/register" className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline text-sm ml-1 transition-colors">สมัครสมาชิกใหม่</Link>
        </div>
      </div>
    </div>
  );
}