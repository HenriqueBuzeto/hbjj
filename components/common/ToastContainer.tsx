'use client';

import React from 'react';
import { useAppContext } from '@/context/AppContext';
import Toast from './Toast';

const ToastContainer = () => {
  const { notification, showNotification } = useAppContext();
  
  const handleClose = () => {
    showNotification('', 'success'); // Clear notification
  };

  return (
    <>
      {notification && (
        <Toast
          message={notification.msg}
          type={notification.type}
          isVisible={!!notification}
          onClose={handleClose}
        />
      )}
    </>
  );
};

export default ToastContainer;
