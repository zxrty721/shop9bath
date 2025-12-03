import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info' | 'success'; // เพื่อเปลี่ยนสีปุ่ม
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

  // กำหนดสีตาม Variant
  const colorStyles = {
    danger: "bg-red-600 hover:bg-red-700 shadow-red-200 text-white",
    warning: "bg-orange-500 hover:bg-orange-600 shadow-orange-200 text-white",
    info: "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200 text-white",
    success: "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200 text-white"
  };

  const iconStyles = {
    danger: "bg-red-100 text-red-600",
    warning: "bg-orange-100 text-orange-600",
    info: "bg-indigo-100 text-indigo-600",
    success: "bg-emerald-100 text-emerald-600"
  };

  return (
    <div className="fixed inset-0 z-999 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Box */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-scale-up border border-slate-100">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X size={20} />
        </button>

        <div className="p-6 text-center">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 ${iconStyles[variant]}`}>
            <AlertTriangle size={28} strokeWidth={2.5} />
          </div>
          
          <h3 className="text-lg font-bold text-slate-800 mb-2">{title}</h3>
          <p className="text-sm text-slate-500 mb-6 leading-relaxed">
            {message}
          </p>

          <div className="flex gap-3 justify-center">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl font-bold text-sm text-slate-600 hover:bg-slate-100 transition-colors border border-slate-200 bg-white"
            >
              {cancelText}
            </button>
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