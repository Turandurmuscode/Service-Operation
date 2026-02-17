import React from 'react';
import './LoadingSpinner.css';

function LoadingSpinner({ message = 'Yükleniyor...' }) {
  return (
    <div className="loading-spinner">
      <div className="spinner-ring"></div>
      <p>{message}</p>
    </div>
  );
}

export default LoadingSpinner;