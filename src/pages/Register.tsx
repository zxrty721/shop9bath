import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api'; // ✅ ใช้ api ตัวกลาง
import { User, Lock, Briefcase, BadgeCheck, ArrowLeft, AlertCircle } from 'lucide-react';
import AlertModal from '../components/ui/AlertModal';

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    fullname: '',
    role: 'staff'
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [alertConfig, setAlertConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    variant: 'success' | 'error' | 'info';
  }>({
    isOpen: false, title: '', message: '', variant: 'success'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      await api.post('/register', formData);
      
      setAlertConfig({
        isOpen: true,
        title: 'สมัครสมาชิกสำเร็จ! 🎉',
        message: 'บัญชีของคุณถูกสร้างเรียบร้อยแล้ว\nกรุณาเข้าสู่ระบบเพื่อเริ่มต้นใช้งาน',
        variant: 'success'
      });

    } catch (err: any) {
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseAlert = () => {
    setAlertConfig({ ...alertConfig, isOpen: false });
    if (alertConfig.variant === 'success') {
      navigate('/'); // ✅ กลับไปหน้า Login เมื่อสำเร็จ
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 font-prompt p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-indigo-600/20 rounded-full animate-pulse"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-blue-600/20 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>

      <div className="bg-white/95 p-8 md:p-10 rounded-3xl shadow-2xl w-full max-w-md z-10 border border-white/20 animate-fade-in">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-linear-to-br from-indigo-600 to-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-xl mx-auto mb-4 transform hover:scale-105 transition-transform">
            NC
          </div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Create Account</h2>
          <p className="text-slate-500 text-xs mt-2 uppercase tracking-widest font-semibold">NINECORE REGISTRATION</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm mb-6 font-medium flex items-center gap-2 animate-pulse">
            <AlertCircle size={18} /> {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="relative group">
            <BadgeCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors z-10" size={20} />
            <input type="text" name="fullname" value={formData.fullname} className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 focus:bg-white transition-all font-medium text-slate-700" placeholder="ชื่อ-นามสกุล (Fullname)" onChange={handleChange} required />
          </div>
          <div className="relative group">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors z-10" size={20} />
            <input type="text" name="username" value={formData.username} className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 focus:bg-white transition-all font-medium text-slate-700" placeholder="ชื่อผู้ใช้ (Username)" onChange={handleChange} required />
          </div>
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors z-10" size={20} />
            <input type="password" name="password" value={formData.password} className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 focus:bg-white transition-all font-medium text-slate-700" placeholder="รหัสผ่าน (Password)" onChange={handleChange} required />
          </div>
          <div className="relative group">
            <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors z-10" size={20} />
            <select name="role" value={formData.role} className="w-full pl-12 pr-10 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 focus:bg-white transition-all font-medium text-slate-700 appearance-none cursor-pointer" onChange={handleChange}>
              <option value="staff">Staff (เจ้าหน้าที่)</option>
              <option value="manager">Manager (ผู้จัดการ)</option>
              <option value="director">Director (ผู้อำนวยการ)</option>
            </select>
          </div>
          <button type="submit" disabled={isLoading} className={`w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl shadow-lg hover:bg-black transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 mt-6 ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-xl'}`}>
            {isLoading ? 'กำลังบันทึก...' : 'ยืนยันการสมัคร'}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-slate-100 pt-6">
          <Link to="/" className="inline-flex items-center text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors group">
            <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" /> กลับไปหน้าเข้าสู่ระบบ
          </Link>
        </div>
      </div>

      <AlertModal isOpen={alertConfig.isOpen} onClose={handleCloseAlert} title={alertConfig.title} message={alertConfig.message} variant={alertConfig.variant} />
    </div>
  );
}