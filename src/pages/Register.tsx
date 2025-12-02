import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { UserPlus, User, Lock, Briefcase, BadgeCheck, ArrowLeft } from 'lucide-react';

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      // จำลอง Delay นิดหน่อยให้ดูเหมือนประมวลผล (ลบได้ถ้าไม่ชอบ)
      await new Promise(r => setTimeout(r, 800));
      
      await api.post('/register', formData);
      alert('🎉 สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบ');
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-600 to-cyan-400 p-4">
      <div className="bg-white/95 p-8 rounded-2xl shadow-2xl w-full max-w-md transform transition-all duration-300 hover:scale-[1.01]">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600 mb-4 shadow-inner">
            <UserPlus size={32} />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-800">สร้างบัญชีใหม่</h2>
          <p className="text-gray-500 text-sm mt-2">กรอกข้อมูลเพื่อเริ่มต้นใช้งานระบบ Shop 9 Baht</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-md mb-6 text-sm flex items-center animate-pulse">
            <span className="mr-2">⚠️</span> {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-5">
          
          {/* Fullname Input */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1 ml-1">ชื่อ-นามสกุล</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                <BadgeCheck size={20} />
              </div>
              <input
                type="text"
                name="fullname"
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white"
                placeholder="สมชาย ใจดี"
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Username Input */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1 ml-1">ชื่อผู้ใช้ (Username)</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                <User size={20} />
              </div>
              <input
                type="text"
                name="username"
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white"
                placeholder="somchai01"
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1 ml-1">รหัสผ่าน</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                <Lock size={20} />
              </div>
              <input
                type="password"
                name="password"
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white"
                placeholder="••••••••"
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Role Select */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1 ml-1">ตำแหน่ง</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                <Briefcase size={20} />
              </div>
              <select
                name="role"
                className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white appearance-none cursor-pointer"
                onChange={handleChange}
              >
                <option value="staff">พนักงานทั่วไป (Staff)</option>
                <option value="admin">ผู้จัดการ (Admin)</option>
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full flex justify-center items-center bg-linear-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:shadow-xl transform transition hover:-translate-y-0.5 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                กำลังสมัครสมาชิก...
              </>
            ) : (
              'ยืนยันการสมัคร'
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div className="mt-8 text-center border-t pt-6">
          <Link to="/" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors">
            <ArrowLeft size={16} className="mr-1" /> กลับไปหน้าเข้าสู่ระบบ
          </Link>
        </div>

      </div>
    </div>
  );
}