/**
 * Toast Notification Component
 * Provides user feedback for actions (success, error, info, warning)
 */
import React, { useEffect } from 'react';
import './Toast.css';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
  actionLabel?: string;
  onAction?: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose, duration = 3000, actionLabel, onAction }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
        return 'ℹ';
    }
  };

  return (
    <div className={`toast toast-${type}`} role="alert" aria-live="polite">
      <span className="toast-icon">{getIcon()}</span>
      <span className="toast-message">{message}</span>
      {actionLabel && onAction ? (
        <button className="toast-action" onClick={onAction}>
          {actionLabel}
        </button>
      ) : null}
      <button 
        className="toast-close" 
        onClick={onClose}
        aria-label="Close notification"
      >
        ×
      </button>
    </div>
  );
};

export default Toast;
