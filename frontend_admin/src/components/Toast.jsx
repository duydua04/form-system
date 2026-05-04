import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

const ICONS = {
  success: <CheckCircle style={{ width: 20, height: 20, color: '#16a34a', flexShrink: 0 }} />,
  error:   <AlertCircle  style={{ width: 20, height: 20, color: '#dc2626', flexShrink: 0 }} />,
  info:    <Info         style={{ width: 20, height: 20, color: '#2563eb', flexShrink: 0 }} />,
};

const BG = {
  success: { background: '#f0fdf4', border: '1px solid #86efac', color: '#15803d' },
  error:   { background: '#fef2f2', border: '1px solid #fca5a5', color: '#b91c1c' },
  info:    { background: '#eff6ff', border: '1px solid #93c5fd', color: '#1d4ed8' },
};

/**
 * Toast – thông báo nhẹ, tự đóng sau `duration` ms.
 *
 * Props:
 *   toast    : { id, message, type: 'success'|'error'|'info' } | null
 *   onClose  : () => void
 *   duration : number (ms, mặc định 3000)
 */
const Toast = ({ toast, onClose, duration = 3000 }) => {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [toast, onClose, duration]);

  if (!toast) return null;

  const type = toast.type || 'info';

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '28px',
        right: '28px',
        zIndex: 9999,
        animation: 'slideUp 0.25s ease',
      }}
    >
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '10px',
          padding: '14px 16px',
          borderRadius: '10px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
          maxWidth: '360px',
          minWidth: '260px',
          ...BG[type],
        }}
      >
        {ICONS[type]}

        <span style={{ flex: 1, fontSize: '14px', lineHeight: '1.5', paddingTop: '1px' }}>
          {toast.message}
        </span>

        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '2px',
            color: 'inherit',
            opacity: 0.6,
            flexShrink: 0,
          }}
          title="Đóng"
        >
          <X style={{ width: 16, height: 16 }} />
        </button>
      </div>
    </div>
  );
};

export default Toast;
