/**
 * Toast Container Component
 * Renders all active toasts
 */
import React from 'react';
import Toast, { ToastType } from './Toast';

interface ToastState {
  message: string;
  type: ToastType;
  id: number;
}

interface ToastContainerProps {
  toasts: ToastState[];
  onClose: (id: number) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onClose }) => {
  return (
    <div style={{ position: 'fixed', top: 0, right: 0, zIndex: 10000 }}>
      {toasts.map((toast, index) => (
        <div 
          key={toast.id} 
          style={{ 
            marginBottom: index < toasts.length - 1 ? '10px' : '0' 
          }}
        >
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => onClose(toast.id)}
          />
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
