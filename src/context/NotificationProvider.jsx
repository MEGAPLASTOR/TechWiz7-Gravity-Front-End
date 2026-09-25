import React, { useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { NotificationContext } from './NotificationContext';

export const NotificationProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random().toString();
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const success = useCallback((msg) => addToast(msg, 'success'), [addToast]);
  const error = useCallback((msg) => addToast(msg, 'error'), [addToast]);
  const info = useCallback((msg) => addToast(msg, 'info'), [addToast]);

  return (
    <NotificationContext.Provider value={{ addToast, removeToast, success, error, info }}>
      {children}
      {/* Toast container floating at top right */}
      <div style={{
        position: 'fixed',
        top: '24px',
        right: '24px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        maxWidth: '400px',
        width: 'calc(100% - 48px)',
        pointerEvents: 'none',
      }}>
        {toasts.map((toast) => {
          const isSuccess = toast.type === 'success';
          const isError = toast.type === 'error';

          return (
            <div
              key={toast.id}
              className="animate-slide-up"
              style={{
                pointerEvents: 'auto',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '14px 18px',
                borderRadius: '14px',
                background: 'rgba(21, 29, 42, 0.95)',
                backdropFilter: 'blur(12px)',
                boxShadow: '0 16px 36px rgba(0, 0, 0, 0.7), 0 0 20px rgba(16, 185, 129, 0.15)',
                border: `1px solid ${isSuccess ? 'rgba(52, 211, 153, 0.4)' : isError ? 'rgba(239, 68, 68, 0.4)' : 'rgba(59, 130, 246, 0.4)'}`,
                borderLeft: `5px solid ${isSuccess ? '#10b981' : isError ? '#ef4444' : '#3b82f6'}`,
              }}
            >
              {isSuccess && <CheckCircle2 size={20} color="#34d399" style={{ flexShrink: 0 }} />}
              {isError && <AlertCircle size={20} color="#f87171" style={{ flexShrink: 0 }} />}
              {!isSuccess && !isError && <Info size={20} color="#60a5fa" style={{ flexShrink: 0 }} />}

              <div style={{ flex: 1, fontSize: '0.9rem', color: '#f8fafc', fontWeight: 600, lineHeight: 1.4 }}>
                {toast.message}
              </div>

              <button
                onClick={() => removeToast(toast.id)}
                style={{
                  color: '#94a3b8',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  borderRadius: '6px',
                  cursor: 'pointer',
                }}
              >
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </NotificationContext.Provider>
  );
};

export default NotificationProvider;
