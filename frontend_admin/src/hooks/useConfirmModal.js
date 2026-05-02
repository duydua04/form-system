import { useState } from 'react';

export const useConfirmModal = () => {
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    onCancel: () => {},
    confirmText: 'Đồng ý',
    cancelText: 'Hủy'
  });

  const openConfirm = (options) => {
    setConfirmModal({
      isOpen: true,
      title: options.title || 'Xác nhận',
      message: options.message || '',
      confirmText: options.confirmText || 'Đồng ý',
      cancelText: options.cancelText || 'Hủy',
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        if (options.onConfirm) {
          await options.onConfirm();
        }
      },
      onCancel: async () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        if (options.onCancel) {
          await options.onCancel();
        }
      }
    });
  };

  const closeConfirm = () => {
    setConfirmModal(prev => ({ ...prev, isOpen: false }));
  };

  return {
    confirmModal,
    openConfirm,
    closeConfirm
  };
};
