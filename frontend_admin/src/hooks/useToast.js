import { useState, useCallback } from 'react';

/**
 * useToast – quản lý trạng thái hiển thị Toast.
 *
 * Trả về:
 *   toast        : object | null  — truyền thẳng vào <Toast toast={toast} />
 *   showToast    : (message, type?) => void
 *   closeToast   : () => void
 *
 * Ví dụ:
 *   const { toast, showToast, closeToast } = useToast();
 *   showToast('Lưu thành công!', 'success');
 *   <Toast toast={toast} onClose={closeToast} />
 */
export const useToast = () => {
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'info') => {
    setToast({ id: Date.now(), message, type });
  }, []);

  const closeToast = useCallback(() => {
    setToast(null);
  }, []);

  return { toast, showToast, closeToast };
};