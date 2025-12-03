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

  const styles = {
    success: { bg: "bg-emerald-100", icon: "text-emerald-600", btn: "bg-emerald-600 hover:bg-emerald-700", Icon: CheckCircle2 },
    error: { bg: "bg-red-100", icon: "text-red-600", btn: "bg-red-600 hover:bg-red-700", Icon: XCircle },
    info: { bg: "bg-indigo-100", icon: "text-indigo-600", btn: "bg-indigo-600 hover:bg-indigo-700", Icon: Info },
  };

  const { bg, icon, btn, Icon } = styles[variant];

  return (
    <div className="fixed inset-0 z-1000 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-scale-up border border-slate-100">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
          <X size={20} />
        </button>

        <div className="p-6 text-center">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 ${bg} ${icon}`}>
            <Icon size={32} />
          </div>
          
          <h3 className="text-xl font-bold text-slate-800 mb-2">{title}</h3>
          <p className="text-slate-500 mb-6 text-sm leading-relaxed whitespace-pre-line">
            {message}
          </p>

          <button
            onClick={onClose}
            className={`w-full py-2.5 rounded-xl font-bold text-white shadow-lg transition-all transform active:scale-95 ${btn}`}
          >
            ตกลง / ปิด
          </button>
        </div>
      </div>
    </div>
  );
}