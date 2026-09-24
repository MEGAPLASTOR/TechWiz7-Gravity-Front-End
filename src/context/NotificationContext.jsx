import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const NotificationContext = createContext(null);

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
                background: '#ffffff',
                boxShadow: '0 12px 30px rgba(0, 0, 0, 0.12), 0 2px 6px rgba(0, 0, 0, 0.06)',
                border: `1px solid ${isSuccess ? '#bbf7d0' : isError ? '#fecaca' : '#e2e8f0'}`,
                borderLeft: `5px solid ${isSuccess ? '#15803d' : isError ? '#dc2626' : '#3b82f6'}`,
              }}
            >
              {isSuccess && <CheckCircle2 size={20} color="#15803d" style={{ flexShrink: 0 }} />}
              {isError && <AlertCircle size={20} color="#dc2626" style={{ flexShrink: 0 }} />}
              {!isSuccess && !isError && <Info size={20} color="#3b82f6" style={{ flexShrink: 0 }} />}

              <div style={{ flex: 1, fontSize: '0.9rem', color: '#0f172a', fontWeight: 500 }}>
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

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
