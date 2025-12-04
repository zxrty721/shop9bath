import { CheckCircle2, XCircle, Info, X } from 'lucide-react';

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  variant?: 'success' | 'error' | 'info';
}

export default function AlertModal({
  isOpen,
  onClose,
  title,
  message,
  variant = 'info'
}: AlertModalProps) {
  if (!isOpen) return null;

  // ✅ ปรับสีให้เป็น Tone ดำ/เทา (Zinc/Black)
  const styles = {
    success: { 
      bg: "bg-emerald-100 dark:bg-emerald-900/30", 
      icon: "text-emerald-700 dark:text-emerald-400", 
      btn: "bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-600", 
      Icon: CheckCircle2 
    },
    error: { 
      bg: "bg-red-100 dark:bg-red-900/30", 
      icon: "text-red-700 dark:text-red-400", 
      btn: "bg-red-600 hover:bg-red-700 text-white dark:bg-red-600", 
      Icon: XCircle 
    },
    // ⚫️ เปลี่ยน Info เป็นสีดำ (Black Theme)
    info: { 
      bg: "bg-zinc-100 dark:bg-zinc-800", 
      icon: "text-zinc-900 dark:text-white", 
      // ปุ่มสีดำสนิท (Zinc-900 / Black)
      btn: "bg-zinc-900 hover:bg-black text-white dark:bg-white dark:text-black dark:hover:bg-zinc-200", 
      Icon: Info 
    },
  };

  const { bg, icon, btn, Icon } = styles[variant];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-prompt">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-white dark:bg-zinc-950 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-scale-up border border-zinc-100 dark:border-zinc-800 transition-colors duration-300">
        <button onClick={onClose} className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">
          <X size={20} />
        </button>

        <div className="p-6 text-center">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 ${bg} ${icon}`}>
            <Icon size={32} />
          </div>
          
          <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">{title}</h3>
          <p className="text-zinc-500 dark:text-zinc-400 mb-6 text-sm leading-relaxed whitespace-pre-line">
            {message}
          </p>

          <button
            onClick={onClose}
            className={`w-full py-2.5 rounded-xl font-bold shadow-lg transition-all transform active:scale-95 ${btn}`}
          >
            ตกลง / ปิด
          </button>
        </div>
      </div>
    </div>
  );
}