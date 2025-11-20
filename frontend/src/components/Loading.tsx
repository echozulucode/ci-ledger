/**
 * Loading Spinner Component
 * Shows loading state with optional message
 */
import React from 'react';
import './Loading.css';

interface LoadingProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
  fullScreen?: boolean;
}

const Loading: React.FC<LoadingProps> = ({ 
  message = 'Loading...', 
  size = 'medium',
  fullScreen = false 
}) => {
  const content = (
    <>
      <div className={`spinner spinner-${size}`} role="status" aria-label="Loading">
        <div className="spinner-circle"></div>
      </div>
      {message && <p className="loading-message">{message}</p>}
    </>
  );

  if (fullScreen) {
    return (
      <div className="loading-fullscreen">
        {content}
      </div>
    );
  }

  return <div className="loading-inline">{content}</div>;
};

export default Loading;
