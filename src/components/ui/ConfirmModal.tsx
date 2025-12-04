import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info' | 'success'; 
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "ยืนยัน",
  cancelText = "ยกเลิก",
  variant = 'danger'
}: ConfirmModalProps) {
  if (!isOpen) return null;

  // ✅ ปรับสีปุ่มยืนยัน (Action Button)
  const colorStyles = {
    danger: "bg-red-600 hover:bg-red-700 text-white shadow-red-200 dark:shadow-none",
    warning: "bg-orange-500 hover:bg-orange-600 text-white shadow-orange-200 dark:shadow-none",
    success: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200 dark:shadow-none",
    
    // ⚫️ เปลี่ยน Info เป็นสีดำ (Black Button)
    info: "bg-zinc-900 hover:bg-black text-white dark:bg-white dark:text-black dark:hover:bg-zinc-200 shadow-zinc-200 dark:shadow-none"
  };

  // ✅ ปรับสีพื้นหลังไอคอน
  const iconStyles = {
    danger: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400",
    warning: "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400",
    success: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400",
    
    // ⚫️ เปลี่ยน Info เป็นสีเทา/ดำ
    info: "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white"
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-prompt">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Box */}
      <div className="relative bg-white dark:bg-zinc-950 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-scale-up border border-zinc-100 dark:border-zinc-800 transition-colors duration-300">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
        >
          <X size={20} />
        </button>

        <div className="p-6 text-center">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 ${iconStyles[variant]}`}>
            <AlertTriangle size={28} strokeWidth={2.5} />
          </div>
          
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">{title}</h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6 leading-relaxed">
            {message}
          </p>

          <div className="flex gap-3 justify-center">
            {/* ปุ่ม Cancel สีขาว/เทา */}
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl font-bold text-sm text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"
            >
              {cancelText}
            </button>
            {/* ปุ่ม Confirm สีตาม Variant */}
            <button
              onClick={() => { onConfirm(); onClose(); }}
              className={`px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg transition-all transform active:scale-95 ${colorStyles[variant]}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}