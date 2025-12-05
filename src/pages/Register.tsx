import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
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
      navigate('/');
    }
  };

  return (
    // ✅ พื้นหลัง: รองรับ Dark Mode (ใช้ Gradient เดียวกับ Login)
    <div className="min-h-screen flex items-center justify-center bg-zinc-100 dark:bg-linear-to-br dark:from-zinc-900 dark:via-black dark:to-zinc-900 font-prompt p-4 relative overflow-hidden transition-colors duration-500">
      
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-indigo-600/20 rounded-full animate-pulse"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-blue-600/20 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>

      {/* ✅ Card: เพิ่ม dark:bg-zinc-900/90 */}
      <div className="bg-white dark:bg-zinc-900/90 backdrop-blur-xl p-8 md:p-10 rounded-3xl shadow-2xl w-full max-w-md z-10 border border-zinc-200 dark:border-zinc-800 animate-fade-in transition-colors duration-300">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">สมัครสมาชิกสำเร็จ</h2>
          <p className="text-zinc-500 dark:text-zinc-400 text-xs mt-2 uppercase tracking-widest font-semibold">SHOP9BATH REGISTRATION</p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 px-4 py-3 rounded-xl text-sm mb-6 font-medium flex items-center gap-2 animate-pulse">
            <AlertCircle size={18} /> {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="relative group">
            <BadgeCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 transition-colors z-10" size={20} />
            {/* ✅ Input: เพิ่ม dark:bg-black และ dark:text-white */}
            <input type="text" name="fullname" value={formData.fullname} className="w-full pl-12 pr-4 py-3.5 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/30 dark:focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-medium text-zinc-900 dark:text-white placeholder:text-zinc-400" placeholder="ชื่อ-นามสกุล (Fullname)" onChange={handleChange} required />
          </div>
          <div className="relative group">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 transition-colors z-10" size={20} />
            <input type="text" name="username" value={formData.username} className="w-full pl-12 pr-4 py-3.5 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/30 dark:focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-medium text-zinc-900 dark:text-white placeholder:text-zinc-400" placeholder="ชื่อผู้ใช้ (Username)" onChange={handleChange} required />
          </div>
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 transition-colors z-10" size={20} />
            <input type="password" name="password" value={formData.password} className="w-full pl-12 pr-4 py-3.5 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/30 dark:focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-medium text-zinc-900 dark:text-white placeholder:text-zinc-400" placeholder="รหัสผ่าน (Password)" onChange={handleChange} required />
          </div>
          <div className="relative group">
            <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 transition-colors z-10" size={20} />
            <select name="role" value={formData.role} className="w-full pl-12 pr-10 py-3.5 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/30 dark:focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-medium text-zinc-900 dark:text-white appearance-none cursor-pointer" onChange={handleChange}>
              <option value="staff">Staff (เจ้าหน้าที่)</option>
              <option value="manager">Manager (ผู้จัดการ)</option>
              <option value="director">Director (ผู้อำนวยการ)</option>
            </select>
          </div>
          <button type="submit" disabled={isLoading} className={`w-full bg-zinc-900 hover:bg-black dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black font-bold py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 mt-6 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}>
            {isLoading ? 'กำลังบันทึก...' : 'ยืนยันการสมัคร'}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-zinc-100 dark:border-zinc-800 pt-6">
          <Link to="/" className="inline-flex items-center text-sm font-bold text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors group">
            <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" /> กลับไปหน้าเข้าสู่ระบบ
          </Link>
        </div>
      </div>

      <AlertModal isOpen={alertConfig.isOpen} onClose={handleCloseAlert} title={alertConfig.title} message={alertConfig.message} variant={alertConfig.variant} />
    </div>
  );
}